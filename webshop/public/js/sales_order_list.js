frappe.ui.form.on('Sales Order', {
    refresh(frm) {
        setTimeout(() => {
            frm.remove_custom_button(__('Payment Request'), __('Create'));
            frm.remove_custom_button(__('Payment'), __('Create'));
            frm.remove_custom_button(__('Update Items'));
            frm.remove_custom_button(__('Hold'),__('Status'));
            frm.remove_custom_button(__('Close'),__('Status'));
        }, 10);
    }
});
