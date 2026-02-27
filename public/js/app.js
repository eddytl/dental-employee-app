// API Configuration
const API_BASE = 'http://localhost:5050/api';

// State Management
let currentPage = 'dashboard';
let employees = [];
let departments = [];
let currentEmployee = null;
let currentDepartment = null;

// Initialize Application
$(document).ready(function() {
    loadPage('dashboard');
    setupEventListeners();
    loadInitialData();
});

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    $('.nav-item a').on('click', function(e) {
        e.preventDefault();
        const page = $(this).attr('href').substring(1);
        loadPage(page);
        updateActiveNav($(this).parent());
    });

    // Modal close buttons
    $('.close-btn, .modal-overlay').on('click', closeModals);

    // Search with debounce
    let searchTimeout;
    $('#searchInput').on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchEmployees($(this).val());
        }, 300);
    });

    // Filter change
    $('#departmentFilter').on('change', function() {
        filterByDepartment($(this).val());
    });
}

// Load Initial Data
async function loadInitialData() {
    await Promise.all([
        fetchEmployees(),
        fetchDepartments()
    ]);
}

// Page Loading
function loadPage(page) {
    currentPage = page;
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'employees':
            loadEmployeesPage();
            break;
        case 'departments':
            loadDepartmentsPage();
            break;
    }
}

// ==================== DASHBOARD ====================
function loadDashboard() {
    const content = `
        <div class="page-header">
            <h1>Dashboard</h1>
        </div>
        
        <div class="dashboard-stats" id="dashboardStats">
            ${renderDashboardSkeleton()}
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="table-container">
                <div style="padding: 20px; border-bottom: 1px solid #e1e8ed;">
                    <h3 style="color: #2c3e50;">Recent Employees</h3>
                </div>
                <div id="recentEmployees">
                    ${renderRecentEmployeesSkeleton()}
                </div>
            </div>
            
            <div class="table-container">
                <div style="padding: 20px; border-bottom: 1px solid #e1e8ed;">
                    <h3 style="color: #2c3e50;">Departments Overview</h3>
                </div>
                <div id="departmentOverview">
                    ${renderDepartmentOverviewSkeleton()}
                </div>
            </div>
        </div>
    `;

    $('#main-content').html(content);
    updateDashboardStats();
}

function renderDashboardSkeleton() {
    return Array(4).fill().map(() => `
        <div class="stat-card" style="opacity: 0.6;">
            <div class="stat-info">
                <h3>Loading...</h3>
                <div class="stat-number">-</div>
            </div>
            <div class="stat-icon">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        </div>
    `).join('');
}

async function updateDashboardStats() {
    try {
        const [employeesRes, departmentsRes] = await Promise.all([
            $.get(`${API_BASE}/employees`),
            $.get(`${API_BASE}/departments`)
        ]);

        const stats = [
            { label: 'Total Employees', value: employeesRes.count, icon: 'users', color: '#3498db' },
            { label: 'Total Departments', value: departmentsRes.count, icon: 'building', color: '#2ecc71' },
            { label: 'Avg Employees/Dept', value: (employeesRes.count / departmentsRes.count).toFixed(1), icon: 'calculator', color: '#f39c12' },
            { label: 'Active Staff', value: employeesRes.count, icon: 'user-check', color: '#9b59b6' }
        ];

        const statsHtml = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-info">
                    <h3>${stat.label}</h3>
                    <div class="stat-number">${stat.value}</div>
                </div>
                <div class="stat-icon" style="background: ${stat.color}20;">
                    <i class="fas fa-${stat.icon}" style="color: ${stat.color};"></i>
                </div>
            </div>
        `).join('');

        $('#dashboardStats').html(statsHtml);

        // Update recent employees
        const recentEmployees = employeesRes.data.slice(0, 5);
        updateRecentEmployees(recentEmployees);

        // Update department overview
        updateDepartmentOverview(departmentsRes.data, employeesRes.data);

    } catch (error) {
        showAlert('Error loading dashboard stats', 'error');
    }
}

// ==================== EMPLOYEES PAGE ====================
function loadEmployeesPage() {
    const content = `
        <div class="page-header">
            <h1>Employee Management</h1>
            <button class="btn-primary" onclick="showAddEmployeeModal()">
                <i class="fas fa-plus"></i> Add Employee
            </button>
        </div>
        
        <div class="search-container">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" placeholder="Search employees by name...">
            </div>
            <select class="filter-select" id="departmentFilter">
                <option value="">All Departments</option>
                ${departments.map(d => `<option value="${d._id}">${d.name}</option>`).join('')}
            </select>
        </div>
        
        <div class="table-container">
            <table id="employeesTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="employeesTableBody">
                    ${renderEmployeeRows(employees)}
                </tbody>
            </table>
        </div>
        
        <!-- Add/Edit Employee Modal -->
        ${renderEmployeeModal()}
    `;

    $('#main-content').html(content);
    fetchEmployees();
}

function renderEmployeeRows(employees) {
    if (!employees || employees.length === 0) {
        return `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 3rem; color: #ccc; margin-bottom: 16px;"></i>
                    <p>No employees found</p>
                </td>
            </tr>
        `;
    }

    return employees.map(emp => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                        ${emp.firstName[0]}${emp.lastName[0]}
                    </div>
                    <div>
                        <strong>${emp.firstName} ${emp.lastName}</strong>
                    </div>
                </div>
            </td>
            <td><span class="department-badge">${emp.department?.name || 'N/A'}</span></td>
            <td>${emp.email || '-'}</td>
            <td>${emp.phone || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editEmployee('${emp._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteEmployee('${emp._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ==================== DEPARTMENTS PAGE ====================
function loadDepartmentsPage() {
    const content = `
        <div class="page-header">
            <h1>Department Management</h1>
            <button class="btn-primary" onclick="showAddDepartmentModal()">
                <i class="fas fa-plus"></i> Add Department
            </button>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Department Name</th>
                        <th>Description</th>
                        <th>Employee Count</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="departmentsTableBody">
                    ${renderDepartmentRows(departments)}
                </tbody>
            </table>
        </div>
        
        <!-- Add/Edit Department Modal -->
        ${renderDepartmentModal()}
    `;

    $('#main-content').html(content);
    fetchDepartments();
}

function renderDepartmentRows(departments) {
    if (!departments || departments.length === 0) {
        return `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px;">
                    <i class="fas fa-building" style="font-size: 3rem; color: #ccc; margin-bottom: 16px;"></i>
                    <p>No departments found</p>
                </td>
            </tr>
        `;
    }

    return departments.map(dept => {
        const empCount = employees.filter(e => e.department?._id === dept._id).length;

        return `
            <tr>
                <td><strong>${dept.name}</strong></td>
                <td>${dept.description || 'No description'}</td>
                <td>
                    <span class="department-badge">${empCount} employees</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editDepartment('${dept._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteDepartment('${dept._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== MODAL RENDERING ====================
function renderEmployeeModal() {
    return `
        <div class="modal" id="employeeModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="employeeModalTitle">Add Employee</h2>
                    <button class="close-btn" onclick="closeModals()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="employeeForm" onsubmit="saveEmployee(event)">
                        <input type="hidden" id="employeeId">
                        
                        <div class="form-group">
                            <label>First Name *</label>
                            <input type="text" id="firstName" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Last Name *</label>
                            <input type="text" id="lastName" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Department *</label>
                            <select id="department" required>
                                <option value="">Select Department</option>
                                ${departments.map(d => `<option value="${d._id}">${d.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email">
                        </div>
                        
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" id="phone">
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModals()">Cancel</button>
                            <button type="submit" class="btn-primary">Save Employee</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderDepartmentModal() {
    return `
        <div class="modal" id="departmentModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="departmentModalTitle">Add Department</h2>
                    <button class="close-btn" onclick="closeModals()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="departmentForm" onsubmit="saveDepartment(event)">
                        <input type="hidden" id="departmentId">
                        
                        <div class="form-group">
                            <label>Department Name *</label>
                            <input type="text" id="departmentName" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="departmentDescription" rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModals()">Cancel</button>
                            <button type="submit" class="btn-primary">Save Department</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// ==================== API FUNCTIONS ====================
async function fetchEmployees() {
    try {
        const response = await $.get(`${API_BASE}/employees`);
        employees = response.data;

        if (currentPage === 'employees') {
            $('#employeesTableBody').html(renderEmployeeRows(employees));
        } else if (currentPage === 'dashboard') {
            updateDashboardStats();
        }

        return response;
    } catch (error) {
        showAlert('Error fetching employees', 'error');
    }
}

async function fetchDepartments() {
    try {
        const response = await $.get(`${API_BASE}/departments`);
        departments = response.data;

        // Update department filter if it exists
        if ($('#departmentFilter').length) {
            const filter = $('#departmentFilter');
            const currentVal = filter.val();
            filter.html(`
                <option value="">All Departments</option>
                ${departments.map(d => `<option value="${d._id}">${d.name}</option>`).join('')}
            `);
            if (currentVal) filter.val(currentVal);
        }

        // Update department select in employee modal
        if ($('#department').length) {
            const select = $('#department');
            select.html(`
                <option value="">Select Department</option>
                ${departments.map(d => `<option value="${d._id}">${d.name}</option>`).join('')}
            `);
        }

        if (currentPage === 'departments') {
            $('#departmentsTableBody').html(renderDepartmentRows(departments));
        }

        return response;
    } catch (error) {
        showAlert('Error fetching departments', 'error');
    }
}

// ==================== EMPLOYEE CRUD ====================
function showAddEmployeeModal() {
    currentEmployee = null;
    $('#employeeModalTitle').text('Add Employee');
    $('#employeeId').val('');
    $('#firstName').val('');
    $('#lastName').val('');
    $('#department').val('');
    $('#email').val('');
    $('#phone').val('');
    $('#employeeModal').addClass('active');
}

function editEmployee(id) {
    const employee = employees.find(e => e._id === id);
    if (!employee) return;

    currentEmployee = employee;
    $('#employeeModalTitle').text('Edit Employee');
    $('#employeeId').val(employee._id);
    $('#firstName').val(employee.firstName);
    $('#lastName').val(employee.lastName);
    $('#department').val(employee.department?._id || '');
    $('#email').val(employee.email || '');
    $('#phone').val(employee.phone || '');
    $('#employeeModal').addClass('active');
}

async function saveEmployee(event) {
    event.preventDefault();

    const employeeData = {
        firstName: $('#firstName').val(),
        lastName: $('#lastName').val(),
        department: $('#department').val(),
        email: $('#email').val(),
        phone: $('#phone').val()
    };

    // Client-side validation
    if (!employeeData.firstName || !employeeData.lastName || !employeeData.department) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }

    try {
        let response;
        if ($('#employeeId').val()) {
            // Update
            response = await $.ajax({
                url: `${API_BASE}/employees/${$('#employeeId').val()}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(employeeData)
            });
            showAlert('Employee updated successfully', 'success');
        } else {
            // Create
            response = await $.ajax({
                url: `${API_BASE}/employees`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(employeeData)
            });
            showAlert('Employee created successfully', 'success');
        }

        closeModals();
        await fetchEmployees();
    } catch (error) {
        const message = error.responseJSON?.message || 'Error saving employee';
        showAlert(message, 'error');
    }
}

async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
        await $.ajax({
            url: `${API_BASE}/employees/${id}`,
            method: 'DELETE'
        });

        showAlert('Employee deleted successfully', 'success');
        await fetchEmployees();
    } catch (error) {
        showAlert('Error deleting employee', 'error');
    }
}

// ==================== DEPARTMENT CRUD ====================
function showAddDepartmentModal() {
    currentDepartment = null;
    $('#departmentModalTitle').text('Add Department');
    $('#departmentId').val('');
    $('#departmentName').val('');
    $('#departmentDescription').val('');
    $('#departmentModal').addClass('active');
}

function editDepartment(id) {
    const department = departments.find(d => d._id === id);
    if (!department) return;

    currentDepartment = department;
    $('#departmentModalTitle').text('Edit Department');
    $('#departmentId').val(department._id);
    $('#departmentName').val(department.name);
    $('#departmentDescription').val(department.description || '');
    $('#departmentModal').addClass('active');
}

async function saveDepartment(event) {
    event.preventDefault();

    const departmentData = {
        name: $('#departmentName').val(),
        description: $('#departmentDescription').val()
    };

    if (!departmentData.name) {
        showAlert('Department name is required', 'error');
        return;
    }

    try {
        let response;
        if ($('#departmentId').val()) {
            // Update
            response = await $.ajax({
                url: `${API_BASE}/departments/${$('#departmentId').val()}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(departmentData)
            });
            showAlert('Department updated successfully', 'success');
        } else {
            // Create
            response = await $.ajax({
                url: `${API_BASE}/departments`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(departmentData)
            });
            showAlert('Department created successfully', 'success');
        }

        closeModals();
        await fetchDepartments();
    } catch (error) {
        const message = error.responseJSON?.message || 'Error saving department';
        showAlert(message, 'error');
    }
}

async function deleteDepartment(id) {
    const deptEmployees = employees.filter(e => e.department?._id === id);

    if (deptEmployees.length > 0) {
        const message = `Cannot delete department with ${deptEmployees.length} assigned employee(s). Please reassign or delete these employees first.`;
        showAlert(message, 'warning');
        return;
    }

    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
        await $.ajax({
            url: `${API_BASE}/departments/${id}`,
            method: 'DELETE'
        });

        showAlert('Department deleted successfully', 'success');
        await fetchDepartments();
    } catch (error) {
        showAlert('Error deleting department', 'error');
    }
}

// ==================== SEARCH AND FILTER ====================
async function searchEmployees(term) {
    if (!term) {
        $('#employeesTableBody').html(renderEmployeeRows(employees));
        return;
    }

    const filtered = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(term.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(term.toLowerCase())
    );

    $('#employeesTableBody').html(renderEmployeeRows(filtered));
}

function filterByDepartment(departmentId) {
    if (!departmentId) {
        $('#employeesTableBody').html(renderEmployeeRows(employees));
        return;
    }

    const filtered = employees.filter(emp => emp.department?._id === departmentId);
    $('#employeesTableBody').html(renderEmployeeRows(filtered));
}

// ==================== UTILITY FUNCTIONS ====================
function closeModals() {
    $('.modal').removeClass('active');
}

function updateActiveNav(activeItem) {
    $('.nav-item').removeClass('active');
    activeItem.addClass('active');
}

function showAlert(message, type) {
    const alertHtml = `
        <div class="alert alert-${type}">
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer;">&times;</button>
        </div>
    `;

    $('.main-content').prepend(alertHtml);

    // Auto remove after 5 seconds
    setTimeout(() => {
        $('.alert').first().fadeOut(500, function() { $(this).remove(); });
    }, 5000);
}

// Dashboard helper functions
function updateRecentEmployees(recentEmployees) {
    const html = recentEmployees.map(emp => `
        <div style="padding: 16px; border-bottom: 1px solid #e1e8ed; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 35px; height: 35px; background: #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                    ${emp.firstName[0]}${emp.lastName[0]}
                </div>
                <div>
                    <strong>${emp.firstName} ${emp.lastName}</strong>
                    <div style="font-size: 0.85rem; color: #7f8c8d;">${emp.department?.name}</div>
                </div>
            </div>
        </div>
    `).join('') || '<div style="padding: 20px; text-align: center;">No employees found</div>';

    $('#recentEmployees').html(html);
}

function updateDepartmentOverview(departmentsData, employeesData) {
    const html = departmentsData.map(dept => {
        const count = employeesData.filter(e => e.department?._id === dept._id).length;
        const percentage = (count / employeesData.length * 100) || 0;

        return `
            <div style="padding: 16px; border-bottom: 1px solid #e1e8ed;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span><strong>${dept.name}</strong></span>
                    <span>${count} employees</span>
                </div>
                <div style="width: 100%; height: 8px; background: #ecf0f1; border-radius: 4px;">
                    <div style="width: ${percentage}%; height: 100%; background: #3498db; border-radius: 4px;"></div>
                </div>
            </div>
        `;
    }).join('');

    $('#departmentOverview').html(html);
}

function renderRecentEmployeesSkeleton() {
    return Array(3).fill().map(() => `
        <div style="padding: 16px; border-bottom: 1px solid #e1e8ed;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 35px; height: 35px; background: #ecf0f1; border-radius: 50%;"></div>
                <div>
                    <div style="width: 120px; height: 16px; background: #ecf0f1; border-radius: 4px; margin-bottom: 4px;"></div>
                    <div style="width: 80px; height: 12px; background: #ecf0f1; border-radius: 4px;"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderDepartmentOverviewSkeleton() {
    return Array(3).fill().map(() => `
        <div style="padding: 16px; border-bottom: 1px solid #e1e8ed;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="width: 100px; height: 16px; background: #ecf0f1; border-radius: 4px;"></div>
                <div style="width: 40px; height: 16px; background: #ecf0f1; border-radius: 4px;"></div>
            </div>
            <div style="width: 100%; height: 8px; background: #ecf0f1; border-radius: 4px;"></div>
        </div>
    `).join('');
}