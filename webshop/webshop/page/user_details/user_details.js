frappe.pages['user-details'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'User Details',
		single_column: true
	});
	frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "User",
            name: frappe.session.user  // logged-in user
        },
        callback: function(r) {
            if (r.message) {
                let user = r.message;

                // Clear body
                $(page.body).empty();

                // Render basic info
                $(page.body).append(`
                    <div class="user-card mb-4">
                        <h3>${user.full_name}</h3>
                        <p><b>Email:</b> ${user.email}</p>
                        <p><b>Username:</b> ${user.username}</p>
                    </div>
                `);

                // Create editable email field
                let email_field = frappe.ui.form.make_control({
                    df: {
                        fieldtype: 'Data',
                        label: 'Email',
                        fieldname: 'email'
                    },
                    parent: page.body,
                    render_input: true
                });
                email_field.set_value(user.email);

                // Save Button
                $('<button class="btn btn-success mt-3">Save</button>')
                    .appendTo(page.body)
                    .on('click', function() {
                        frappe.call({
                            method: "frappe.client.set_value",
                            args: {
                                doctype: "User",
                                name: user.name,
                                fieldname: "email",
                                value: email_field.get_value()
                            },
                            callback: function() {
                                frappe.msgprint("User updated successfully!");
                            }
                        });
                    });
            }
        }
    });
}