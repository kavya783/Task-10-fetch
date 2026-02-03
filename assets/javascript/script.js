// Containers for card view and table view
const cardContainer = document.getElementById("cardContainer");
const tableBody = document.getElementById("tableBody");

// Variables to track editing, deleting, and image data
let editEmployeeId = null;
let deleteEmployeeId = null;
let img = "";

// Fetch all employees and display them
function fetchEmployees() {
  tableBody.innerHTML = "";
  cardContainer.innerHTML = "";

  // Fetch employee data from server
  fetch("http://localhost:3000/details")
    .then(res => res.json())
    .then(data => {

      // Loop through employee records
      data.forEach((emp) => {

        // Table view row
        tableBody.innerHTML += `
          <tr>
            <td>
              <img src="data:image/png;base64,${emp.image}" 
                   class="img-thumbnail"
                   style="width:100px;height:100px;object-fit:cover">
            </td>
            <td>${emp.firstname}</td>
            <td>${emp.lastname}</td>
            <td>${emp.email}</td>
            <td>
              <div class="d-flex justify-content-around">
                <button class="btn btn-primary btn-sm"
                        data-id="${emp.id}" data-action="view">
                  <i class="bi bi-eye"></i>
                </button>

                <button class="btn btn-success btn-sm"
                        data-id="${emp.id}" data-action="edit">
                  <i class="bi bi-pencil-fill"></i>
                </button>

                <button class="btn btn-danger btn-sm"
                        data-id="${emp.id}" data-action="delete">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </td>
          </tr>
        `;

        // Card view for mobile
        cardContainer.innerHTML += `
          <div class="card mb-3 shadow-sm">
            <div class="card-body bg-info text-center">

              <img src="data:image/png;base64,${emp.image}" 
                   class="img-fluid rounded"
                   style="max-height:120px;object-fit:cover">

              <div class="row mb-1">
                <div class="col-6  ps-4 fw-bold text-start">FirstName:</div>
                <div class="col-6 ps-0 text-start">${emp.firstname}</div>
              </div>

              <div class="row mb-1">
                <div class="col-6 ps-4 fw-bold text-start">LastName:</div>
                <div class="col-6  ps-0 text-start">${emp.lastname}</div>
              </div>

              <div class="row mb-2">
                <div class="col-6  ps-4 fw-bold text-start">Email:</div>
                <div class="col-6 ps-0 text-start">${emp.email}</div>
              </div>

              <div class="d-flex justify-content-between">
                <button class="btn btn-primary btn-sm"
                        data-id="${emp.id}" data-action="view">
                  <i class="bi bi-eye"></i>
                </button>

                <button class="btn btn-success btn-sm"
                        data-id="${emp.id}" data-action="edit">
                  <i class="bi bi-pencil-fill"></i>
                </button>

                <button class="btn btn-danger btn-sm"
                        data-id="${emp.id}" data-action="delete">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>

            </div>
          </div>
        `;
      });
    });
}

// Load employees initially
fetchEmployees();


// Handle image selection
document.getElementById("image").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  // Reset input field
  this.value = "";

  // Restrict image size to 2MB
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("Image is too large! Max 2MB");
    return;
  }

  // Convert image to base64
  const reader = new FileReader();
  reader.onload = function (e) {
    img = e.target.result.split(',')[1];
console.log("Base64 part only:", img);
    const preview = document.getElementById("previewImage");
    preview.src = "data:image/png;base64," + img;
    preview.style.display = "block";
  };

  reader.readAsDataURL(file);
});


// Add or update employee
document.getElementById("addEmployeeBtn").addEventListener("click", () => {

  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;

  // Error containers
  const firstnameError = document.getElementById("firstnameerror");
  const lastnameError = document.getElementById("lastnameerror");
  const emailError = document.getElementById("emailerror");
  const imageError = document.getElementById("imageerror");

  // Clear errors
  firstnameError.innerHTML = "";
  lastnameError.innerHTML = "";
  emailError.innerHTML = "";
  imageError.innerHTML = "";

  // Validate inputs
  if (!/^[A-Z][a-z]{2,}$/.test(firstName)) {
    firstnameError.innerHTML =
      "First name must start with capital & min 3 letters";
    return;
  }

  if (!/^[A-Z][a-z]{2,}$/.test(lastName)) {
    lastnameError.innerHTML =
      "Last name must start with capital & min 3 letters";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.innerHTML = "Enter email ID";
    return;
  }

  if (img.length === 0) {
    imageError.innerHTML = "Please select image";
    return;
  }

  // Base64 approximate size check
  const approxSize = img.length * 0.75;
  const maxBytes = 2 * 1024 * 1024;

  if (approxSize > maxBytes) {
    alert("Selected image exceeds 2MB.");
    return;
  }

  // Decide add or update
  let url, method;

  if (editEmployeeId) {
    url = `http://localhost:3000/details/${editEmployeeId}`;
    method = "PUT";
  } else {
    url = "http://localhost:3000/details";
    method = "POST";
  }

  // Send request
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstname: firstName,
      lastname: lastName,
      email: email,
      image: img
    })
  })
    .then(res => res.json())
    .then(() => {

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("employeeModal")
      );
      modal.hide();

      fetchEmployees();

      // Reset form
      document.getElementById("firstName").value = "";
      document.getElementById("lastName").value = "";
      document.getElementById("email").value = "";
      document.getElementById("addEmployeeBtn").textContent =
        "Add Employee";

      editEmployeeId = null;
    })
    .catch(err => console.error(err));
});


// Handle button clicks (view/edit/delete)
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  // VIEW employee
  if (action === "view") {
    fetch(`http://localhost:3000/details/${id}`)
      .then(res => res.json())
      .then(emp => {

        document.getElementById("viewModalBody").innerHTML = `
          <div class="card shadow-sm text-center mx-auto" style="max-width:360px;">
            <div class="card-body p-4">
              <img src="data:image/png;base64,${emp.image}" 
                   class="img-fluid rounded mb-2"
                   style="max-height:200px">

              <h5>${emp.firstname} ${emp.lastname}</h5>
              <p>${emp.email}</p>
            </div>
          </div>
        `;

        new bootstrap.Modal(
          document.getElementById("viewEmployeeModal")
        ).show();
      });
  }

  // EDIT employee
  if (action === "edit") {
    editEmployeeId = id;

    fetch(`http://localhost:3000/details/${id}`)
      .then(res => res.json())
      .then(emp => {

        document.getElementById("firstName").value = emp.firstname;
        document.getElementById("lastName").value = emp.lastname;
        document.getElementById("email").value = emp.email;

        img = emp.image;

        const preview = document.getElementById("previewImage");
        preview.src = "data:image/png;base64," + img;
        preview.style.display = "block";

        document.getElementById("addEmployeeBtn").textContent =
          "Update Employee";

        new bootstrap.Modal(
          document.getElementById("employeeModal")
        ).show();
      });
  }

  // DELETE employee
  if (action === "delete") {
    deleteEmployeeId = id;

    new bootstrap.Modal(
      document.getElementById("deleteModal")
    ).show();
  }
});


// Confirm delete action
document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
  if (!deleteEmployeeId) return;

  fetch(`http://localhost:3000/details/${deleteEmployeeId}`, {
    method: "DELETE"
  }).then(() => {
    fetchEmployees();
    deleteEmployeeId = null;

    bootstrap.Modal.getInstance(
      document.getElementById("deleteModal")
    ).hide();
  });
});


// Reset modal when closed
const employeeModal = document.getElementById("employeeModal");

employeeModal.addEventListener("hidden.bs.modal", () => {
  editEmployeeId = null;

  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("email").value = "";
  document.getElementById("image").value = "";

  document.getElementById("previewImage").style.display = "none";
  img = "";

  document.getElementById("firstnameerror").innerHTML = "";
  document.getElementById("lastnameerror").innerHTML = "";
  document.getElementById("emailerror").innerHTML = "";
  document.getElementById("imageerror").innerHTML = "";

  document.getElementById("addEmployeeBtn").textContent = "Add Employee";
});
