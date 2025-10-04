frappe.ready(function() {
    $('#edit-profile-form').on('submit', function(e) {
        e.preventDefault();

        let form_data = {};
        $(this).serializeArray().map(x => form_data[x.name] = x.value);

        frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "User",
                name: frappe.session.user,
                fieldname: {
                    "full_name": form_data.full_name,
                    "email": form_data.email,
                    "username": form_data.username,
                    "language": form_data.language,
                    "time_zone": form_data.time_zone
                }
            },
            callback: function(r) {
                if (!r.exc) {
                    frappe.msgprint("Profile updated successfully!");
                    window.location.href = "/user-details"; // redirect back
                }
            }
        });
    });
});
