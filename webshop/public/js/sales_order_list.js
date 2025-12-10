frappe.ui.form.on('Sales Order', {
    refresh(frm) {

        setTimeout(() => {
            frm.remove_custom_button(__('Payment Request'), __('Create'));
            frm.remove_custom_button(__('Payment'), __('Create'));
            frm.remove_custom_button(__('Update Items'));
            frm.remove_custom_button(__('Hold'), __('Status'));
            frm.remove_custom_button(__('Close'), __('Status'));
            frm.page.wrapper.find('.actions-btn-group').remove();
        }, 10);


        const state = frm.doc.workflow_state;
        const is_level1 = frappe.user.has_role("Level 1 Admin");
        const is_level2 = frappe.user.has_role("Level 2 Admin");

        if (is_level1 && state === "Pending L1 Approval") {
            add_action_buttons(frm, "L1");
        }

        if (is_level2 && state === "Pending L2 Approval") {
            add_action_buttons(frm, "L2");
        }
    }
});

function add_action_buttons(frm, level) {

    frm.add_custom_button(__('Approve'), function () {
        trigger_custom_workflow(frm, "approve", level);
    }).addClass("btn-primary");

    frm.add_custom_button(__('Reject'), function () {
        trigger_custom_workflow(frm, "reject", level);
    }).addClass("btn-danger");
}

function trigger_custom_workflow(frm, action_type, level) {

    let workflow_action = "";
    let success_message = "";

    if (level === "L1") {
        workflow_action = action_type === "approve" ? "Approve (L1)" : "Rejected (L1)";
        success_message = action_type === "approve"
            ? "Order approved and pending for Manager Approval."
            : "Order rejected!";
    }
    else if (level === "L2") {
        workflow_action = action_type === "approve" ? "Approve (L2)" : "Rejected (L2)";
        success_message = action_type === "approve"
            ? "Order approved successfully."
            : "Order rejected!";
    }
    else {
        frappe.msgprint("Invalid workflow level.");
        return;
    }

    frappe.call({
        method: "frappe.model.workflow.apply_workflow",
        args: {
            doc: frm.doc,
            action: workflow_action
        },
        callback: function (r) {
            if (!r.exc) {
                 if (level === "L2" && action_type === "approve") {
                    frappe.call({
                        method: "webshop.api.send_level2_notification",
                        args: {
                            sales_order: frm.doc.name,
                            user:frappe.session.user
                        }
                    });
                }
                frappe.show_alert({
                    message: success_message,
                    indicator: "green"
                }, 5);

                frm.reload_doc();
            }
        }
    });
}