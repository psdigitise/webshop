frappe.ui.form.Toolbar = class CustomToolbar extends frappe.ui.form.Toolbar {
    make_navigation() {
        // Navigate (override)
        if (!this.frm.is_new() && !this.frm.meta.issingle) {
            this.page.add_action_icon(
                "es-line-left-chevron",
                () => {
                    this.frm.navigate_records(1);
                },
                "prev-doc",
                __("Previous Order")
            );

            this.page.add_action_icon(
                "es-line-right-chevron",
                () => {
                    this.frm.navigate_records(0);
                },
                "next-doc",
                __("Next Order") 
            );
        }
    }
};
