// frappe.pages['admin-dashboard'].on_page_load = function (wrapper) {
// 	let page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Admin Approval Dashboard',
// 		single_column: true
// 	});

// 	// Add filter section (top bar)
// 	const filter_html = `
// 		<div class="card p-3 mb-4 shadow-sm border-0">
// 			<div class="row g-3 align-items-end">
// 				<div class="col-md-3">
// 					<label class="form-label fw-semibold">From Date</label>
// 					<input type="date" id="from_date" class="form-control">
// 				</div>
// 				<div class="col-md-3">
// 					<label class="form-label fw-semibold">To Date</label>
// 					<input type="date" id="to_date" class="form-control">
// 				</div>
// 				<div class="col-md-3">
// 					<label class="form-label fw-semibold">Search Order ID</label>
// 					<input type="text" id="search_order" class="form-control" placeholder="Enter Order ID">
// 				</div>
// 				<div class="col-md-3 d-flex" style="justify-content: end;">
// 					<button id="filter_btn" class="btn btn-info mt-auto">Filter</button>
// 				</div>
// 			</div>
// 		</div>
// 		<div id="admin-dashboard"></div>
// 	`;

// 	$(filter_html).appendTo(page.body);

// 	// Initial load
// 	load_admin_dashboard(page);

// 	// Filter button click → reload data
// 	page.body.find('#filter_btn').on('click', function () {
// 		load_admin_dashboard(page);
// 	});

// 	// Search order live filter
// 	page.body.on('input', '#search_order', function () {
// 		let search_value = $(this).val().toLowerCase();
// 		page.body.find('tbody tr').each(function () {
// 			let order_id = $(this).find('td:first').text().toLowerCase();
// 			$(this).toggle(order_id.includes(search_value));
// 		});
// 	});
// };

// function load_admin_dashboard(page) {
// 	let container = page.body.find('#admin-dashboard');
// 	container.html(`<div class="text-muted p-3">Loading data...</div>`);

// 	let from_date = page.body.find('#from_date').val();
// 	let to_date = page.body.find('#to_date').val();

// 	frappe.call({
// 		method: "webshop.dasboard.get_web_user_dashboard",
// 		args: {
// 			from_date: from_date || null,
// 			to_date: to_date || null
// 		},
// 		freeze: true,
// 		freeze_message: __("Loading dashboard..."),
// 		callback: function (r) {
// 			container.empty();

// 			if (!r.message) {
// 				container.html(`<div class="text-danger">No data returned.</div>`);
// 				return;
// 			}

// 			const { role, pending_approvals } = r.message;

// 			container.append(`
// 				<div class="mb-4">
// 					<h2 class="fw-bold text-dark mb-1">Admin Approval Dashboard</h2>
// 					<p class="text-muted">${role} - Pending Approvals</p>
// 				</div>
// 			`);

// 			let filtered = pending_approvals || [];

// 			// ✅ Frontend filtering based on date range
// 			if (from_date) {
// 				filtered = filtered.filter(o => new Date(o.transaction_date) >= new Date(from_date));
// 			}
// 			if (to_date) {
// 				filtered = filtered.filter(o => new Date(o.transaction_date) <= new Date(to_date));
// 			}

// 			if (filtered.length) {
// 				let table = `
// 				<div class="card shadow-sm border-0 rounded-3">
// 					<div class="table-responsive">
// 						<table class="table align-middle mb-0">
// 							<thead class="bg-light text-uppercase small fw-semibold text-muted">
// 								<tr>
// 									<th class="py-3 ps-4">Order ID</th>
// 									<th>Customer</th>
// 									<th>Total</th>
// 									<th>Date</th>
// 									<th>Workflow State</th>
// 									<th class="text-center pe-4">Action</th>
// 								</tr>
// 							</thead>
// 							<tbody>
// 								${filtered.map(o => `
// 									<tr class="border-bottom">
// 										<td class="ps-4 py-3 fw-semibold text-dark">
// 											<a href="/app/sales-order/${o.name}" class="text-decoration-none text-primary" target="_blank">${o.name}</a>
// 										</td>
// 										<td>${o.customer_name || '-'}</td>
// 										<td>${(o.grand_total || 0).toFixed(2)}</td>
// 										<td>${o.transaction_date || '-'}</td>
// 										<td><span class="badge bg-light text-dark px-3 py-2">${o.workflow_state}</span></td>
// 										<td class="text-center pe-4">
// 											<a href="/app/sales-order/${o.name}" target="_blank">
// 												<button class="btn btn-info btn-sm d-flex align-items-center justify-content-center gap-1 px-3 py-1 rounded-pill">
// 													View
// 												</button>
// 											</a>
// 										</td>
// 									</tr>
// 								`).join('')}
// 							</tbody>
// 						</table>
// 					</div>
// 				</div>`;
// 				container.append(table);
// 			} else {
// 				container.append(`<div class="text-muted">No pending approvals found for selected date range.</div>`);
// 			}
// 		}
// 	});
// }



frappe.pages['admin-dashboard'].on_page_load = function (wrapper) {
	let page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Admin Approval Dashboard',
		single_column: true
	});

	// Add filter section (top bar)
	const filter_html = `
		<div class="card p-3 mb-4 shadow-sm border-0">
			<div class="row g-3 align-items-end">
				<div class="col-md-3">
					<label class="form-label fw-semibold">From Date</label>
					<input type="date" id="from_date" class="form-control">
				</div>
				<div class="col-md-3">
					<label class="form-label fw-semibold">To Date</label>
					<input type="date" id="to_date" class="form-control">
				</div>
				<div class="col-md-3">
					<label class="form-label fw-semibold">Search Order ID</label>
					<input type="text" id="search_order" class="form-control" placeholder="Enter Order ID">
				</div>
						<div class="col-md-3 d-flex justify-content-end gap-2">
    <button id="filter_btn" class="btn btn-info mt-auto">Filter</button>
    <button id="export_btn" class="btn btn-outline-secondary mt-auto">Export</button>
</div>

			</div>
		</div>
		<div id="admin-dashboard"></div>
	`;

	$(filter_html).appendTo(page.body);

	// Initial load
	load_admin_dashboard(page);

	// Filter button click → reload data
	page.body.find('#filter_btn').on('click', function () {
		load_admin_dashboard(page);
	});

	// Search order live filter
	page.body.on('input', '#search_order', function () {
		let search_value = $(this).val().toLowerCase();
		page.body.find('tbody tr').each(function () {
			let order_id = $(this).find('td:first').text().toLowerCase();
			$(this).toggle(order_id.includes(search_value));
		});
	});
};

function load_admin_dashboard(page) {
	let container = page.body.find('#admin-dashboard');
	container.html(`<div class="text-muted p-3">Loading data...</div>`);

	let from_date = page.body.find('#from_date').val();
	let to_date = page.body.find('#to_date').val();

	frappe.call({
		method: "webshop.dasboard.get_web_user_dashboard",
		args: {
			from_date: from_date || null,
			to_date: to_date || null
		},
		freeze: true,
		freeze_message: __("Loading dashboard..."),
		callback: function (r) {
			container.empty();

			if (!r.message) {
				container.html(`<div class="text-danger">No data returned.</div>`);
				return;
			}

			const { role, pending_approvals } = r.message;

			container.append(`
				<div class="mb-4">
					<h2 class="fw-bold text-dark mb-1">Admin Approval Dashboard</h2>
					<p class="text-muted">${role} - Pending Approvals</p>
				</div>
			`);

			let filtered = pending_approvals || [];

			// ✅ Frontend filtering based on date range
			if (from_date) {
				filtered = filtered.filter(o => new Date(o.transaction_date) >= new Date(from_date));
			}
			if (to_date) {
				filtered = filtered.filter(o => new Date(o.transaction_date) <= new Date(to_date));
			}

			if (filtered.length) {
				let table = `
				<div class="card shadow-sm border-0 rounded-3">
					<div class="table-responsive">
						<table class="table align-middle mb-0">
							<thead class="bg-light text-uppercase small fw-semibold text-muted">
								<tr>
									<th class="py-3 ps-4">Order ID</th>
									<th>Customer</th>
									<th>Total</th>
									<th>Date</th>
									<th>Workflow State</th>
									<th class="text-center pe-4">Action</th>
								</tr>
							</thead>
							<tbody>
								${filtered.map(o => `
									<tr class="border-bottom">
										<td class="ps-4 py-3 fw-semibold text-dark">
											<a href="/app/sales-order/${o.name}" class="text-decoration-none text-primary" target="_blank">${o.name}</a>
										</td>
										<td>${o.customer_name || '-'}</td>
										<td>${(o.grand_total || 0).toFixed(2)}</td>
										<td>${o.transaction_date || '-'}</td>
										<td><span class="badge bg-light text-dark px-3 py-2">${o.workflow_state}</span></td>
										<td class="text-center pe-4">
											<a href="/app/sales-order/${o.name}" target="_blank">
												<button class="btn btn-info btn-sm d-flex align-items-center justify-content-center gap-1 px-3 py-1 rounded-pill">
													View
												</button>
											</a>
										</td>
									</tr>
								`).join('')}
							</tbody>
						</table>
					</div>
				</div>`;
				container.append(table);
			} else {
				container.append(`<div class="text-muted">No pending approvals found for selected date range.</div>`);
			}
		}
	});

	page.body.on('click', '#export_btn', function () {
    let rows = [];
    page.body.find('tbody tr:visible').each(function () {
        let cols = $(this).find('td');
        rows.push([
            cols.eq(0).text().trim(), // Order ID
            cols.eq(1).text().trim(), // Customer
            cols.eq(2).text().trim(), // Total
            cols.eq(3).text().trim(), // Date
            cols.eq(4).text().trim()  // Workflow State
        ]);
    });

    if (rows.length === 0) {
        frappe.msgprint('No data to export.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,"
        + ["Order ID,Customer,Total,Date,Workflow State", ...rows.map(e => e.join(","))].join("\n");

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pending_approvals.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

}
