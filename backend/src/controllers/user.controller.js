import { supabase } from "../config/supabase.js";

export async function getMe(req, res) {
    try {
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", req.user.id)
            .single()

        if (userError) {
            console.error("Error fetching user:", userError);
            return res.status(500).json({ success: false, message: "Failed to fetch user" });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        return res.status(200).json({ success: true, message: "User fetched successfully", user })
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
}

export async function becomeADriver(req, res) {
    const { vehicle_number, license_number } = req.body;

    const licenseRegex = /^[A-Z0-9-]{15,16}$/i;
    const vehicleRegex = /^[A-Z0-9]{10}$/i;

    if (!license_number || !licenseRegex.test(license_number)) {
        return res.status(400).json({
            success: false,
            message: "Invalid License Number. It must be 15-16 alphanumeric characters."
        });
    }

    if (!vehicle_number || !vehicleRegex.test(vehicle_number)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Vehicle Number. Correct format: DL01AB1234"
        });
    }

    try {
        const { data: roleError } = await supabase
            .from("users")
            .update({ role: "DRIVER" })
            .eq("id", req.user.id)
            .eq("role", "RIDER")

        if (roleError) {
            console.error("Error switching role to driver:", roleError)
            return res.status(500).json({ success: false, message: "Failed to switch role to driver" })
        }

        const { data: driverProfile, error: driverProfileError } = await supabase
            .from("driver_profiles")
            .insert({
                user_id: req.user.id,
                license_number,
                vehicle_number,
                is_available: false,
            })
            .single()

        if (driverProfileError) {
            console.error("Error creating driver profile:", driverProfileError)
            return res.status(500).json({ success: false, message: "Failed to create driver profile" })
        }

        return res.status(200).json({ success: true, message: "You are now a registered driver!", profile: driverProfile })
    } catch (error) {
        console.error("Error switching role to driver:", error)
        return res.status(500).json({ success: false, message: "Failed to switch role to driver" })
    }
}