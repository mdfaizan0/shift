import crypto from "crypto"
import { supabase } from "../config/supabase.js"
import { Webhook } from "svix"

export async function handleRazorpayWebhook(req, res) {
    const signature = req.headers["x-razorpay-signature"]
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    const rawBody = req.body

    try {
        const expected_sign = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex")

        if (expected_sign !== signature) {
            return res.status(400).json({ message: "Invalid webhook signature" })
        }

        const event = JSON.parse(rawBody.toString())
        console.log("Webhook event:", event.event)

        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity

            const { error } = await supabase
                .from("rides")
                .update({
                    payment_status: "PAID",
                    razorpay_payment_id: payment.id
                })
                .eq("payment_method", "RAZORPAY")
                .eq("payment_status", "PROCESSING")
                .eq("razorpay_order_id", payment.order_id)

            if (error) {
                console.error("Error updating payment:", error)
                return res.status(500).json({ success: false, message: "Failed to update payment" })
            }
        }

        if (event.event === "payment.failed") {
            const payment = event.payload.payment.entity

            await supabase
                .from("rides")
                .update({
                    payment_status: "FAILED"
                })
                .eq("payment_method", "RAZORPAY")
                .eq("payment_status", "PROCESSING")
                .eq("razorpay_order_id", payment.order_id)
        }

        return res.status(200).json({ success: true, message: "Payment updated successfully" })
    } catch (error) {
        console.error("Error handling razorpay webhook:", error)
        return res.status(500).json({ success: false, message: "Failed to handle razorpay webhook", error: error.message })
    }
}

export async function handleClerkWebhook(req, res) {
    const CLERK_WEBHOOK_SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

    if (!CLERK_WEBHOOK_SIGNING_SECRET) {
        console.error("Missing CLERK_WEBHOOK_SIGNING_SECRET")
        return res.status(500).json({ success: false, message: "Server configuration error" })
    }

    const svix_id = req.headers["svix-id"]
    const svix_timestamp = req.headers["svix-timestamp"]
    const svix_signature = req.headers["svix-signature"]

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ success: false, message: "Error occured -- no svix headers" })
    }

    const payload = req.body.toString()

    const wh = new Webhook(CLERK_WEBHOOK_SIGNING_SECRET)

    let evt

    try {
        evt = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        })
    } catch (err) {
        console.error("Error verifying webhook:", err.message)
        return res.status(400).json({ success: false, message: "Error verifying webhook" })
    }

    const eventType = evt.type

    try {
        if (eventType === "user.created") {
            const { id, email_addresses, first_name, last_name, username } = evt.data
            const { error } = await supabase
                .from("users")
                .upsert({
                    id,
                    email: email_addresses?.[0]?.email_address,
                    name: `${first_name || ""} ${last_name || ""}`.trim() || username || "User",
                    role: "RIDER"
                })
            if (error) {
                console.error("Error creating user:", error)
                return res.status(500).json({ success: false, message: "Failed to create user" })
            }
        }

        if (eventType === "user.updated") {
            const { id, email_addresses, first_name, last_name, username } = evt.data
            const { error } = await supabase
                .from("users")
                .update({
                    email: email_addresses?.[0]?.email_address,
                    name: `${first_name || ""} ${last_name || ""}`.trim() || username || "User",
                })
                .eq("id", id)
            if (error) {
                console.error("Error updating user:", error)
                return res.status(500).json({ success: false, message: "Failed to update user" })
            }
        }

        if (eventType === "user.deleted") {
            const { id } = evt.data
            const { error } = await supabase
                .from("users")
                .delete()
                .eq("id", id)
            if (error) {
                console.error("Error deleting user:", error)
                return res.status(500).json({ success: false, message: "Failed to delete user" })
            }
        }

        return res.status(200).json({ success: true, message: "Webhook processed successfully" })
    } catch (error) {
        console.error("Error in webhook controller logic:", error)
        return res.status(500).json({ success: false, message: "Webhook processing failed" })
    }
}
