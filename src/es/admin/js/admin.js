const host = 'http://localhost:8080';

// check the session
const currentPage = window.location.href;
let newPage = currentPage.replace("/admin/admin.html", "/login.html");
const isLogged = localStorage.getItem('isLogged');
const isAdmin = localStorage.getItem('isAdmin');
const token = localStorage.getItem('token');

if (isLogged === null) {
    window.location.replace(newPage);
} else {
    if (isAdmin === 'false') {
        newPage = currentPage.replace("/admin/admin.html", "/index.html");
        window.location.replace(newPage);
    }
}

// Redirect to another language page
const selectElement = document.getElementById('select-language');

selectElement.addEventListener('change', () => {
    if (selectElement.value === "en") {
        const newPage = currentPage.replace("/es", "/en");
        window.location.replace(newPage);
    }
});

// logout
const logoutButton = document.getElementById('logout');

const logoutFunction = () => {
    fetch(host + '/users/logout', {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            token: localStorage.getItem('token')
        })
    })
    .then(result => {
        return result.json();
    })
    .then(res => {
        if (res.message === 'success') {
            localStorage.removeItem('isLogged');
            localStorage.removeItem('token');
            const newPage = currentPage.replace("/admin/admin.html", "/login.html");
            window.location.replace(newPage);
        }
    })
    .catch(err => {
        console.log(err);
    });
};

logoutButton.addEventListener('click', logoutFunction);

// Get info
jQuery("document").ready(() => {
    getUsers();
    getMails();
});

const getUsers = () => {
    fetch(host + '/admin/users/',
    {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.message === 'success') {
                const results = res.result;
                if (results.length > 0) {
                    html = "<table cellspacing='0' class='table'>" +
                            "<thead>" +
                                "<tr>" +
                                    "<th>id</th>" +
                                    "<th>E-Mail</th>" +
                                    "<th>Nombre</th>" +
                                    "<th>Apellido</th>" +
                                    "<th>Username</th>" +
                                    "<th></th>" +
                                "<tr>" +
                            "</thead>" +
                            "<tbody>";
                    results.forEach(result => {
                        const id = result._id;
                        html += "<tr>" +
                                    "<td id='user_id'>" + result._id + "</td>" +
                                    "<td>" + result.email + "</td>" +
                                    "<td>" + result.name + "</td>" +
                                    "<td>" + result.lastname + "</td>" +
                                    "<td>" + result.username + "</td>";
                        if (result.deleted === false) {
                            html += "<td><button type='button' class='btn-delete-table' onclick='deleteUser(\"" + id + "\");'>Eliminar</button>";
                        } else {
                            html += "<td><button type='button' class='btn-table' onclick='enableUser(\"" + id + "\");'>Habilitar</button>";
                        }
                        html += "<tr>";
                    });
                    html += "</tbody>" +
                        "</table>";
                    jQuery("#users").html(html);
                    jQuery("#users-error").hide();
                }
            }
        });
};

const getMails = () => {
    fetch(host + '/admin/mails/', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.message === 'success') {
                const results = res.result;
                if (results.length > 0) {
                    html = "<table cellspacing='0' class='table'>" +
                    "<thead>" +
                        "<tr>" +
                            "<th>id</th>" +
                            "<th>De</th>" +
                            "<th>Asunto</th>" +
                            "<th>Mensaje</th>" +
                            "<th></th>" +
                        "<tr>" +
                    "</thead>" +
                    "<tbody>";
                    results.forEach(result => {
                        const id = result._id;
                        html += "<tr>" +
                                "<td id='mail_id'>" +  id + "</td>" +
                                "<td>" + result.from + "</td>" +
                                "<td>" + result.subject + "</td>" +
                                "<td>" + result.message + "</td>" +
                                "<td><button type='button' class='btn-delete-table' onclick='deleteMail(\"" + id + "\");'>Eliminar</button>" +
                            "<tr>";
                    });
                    html += "</tbody>" +
                        "</table>";

                    jQuery("#mails").html(html);
                    jQuery("#mails-error").hide();
                }
            }
        });
};

// Show modules
const hideModules = () => {
    jQuery("#users-main").hide();
    jQuery("#mails-main").hide();
};

jQuery("#show-users").on('click', () => {
    hideModules();

    jQuery("#users-main").show();
});

jQuery("#show-mails").on('click', () => {
    hideModules();

    jQuery("#mails-main").show();
});

// Enable and Delete
const enableUser = (id) => {
    fetch(host + '/admin/users/enable', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        method: 'PUT',
        body: JSON.stringify({
            id
        })
    })
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.message === 'success') {
                getUsers();
            }
        })
        .catch(err => {
            console.log(err);
        });
};

const deleteUser = (id) => {
    fetch(host + '/admin/users/delete', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        method: 'DELETE',
        body: JSON.stringify({
            id
        })
    })
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.message === 'success') {
                getUsers();
            }
        })
        .catch(err => {
            console.log(err);
        });
};

const deleteMail = (id) => {
    fetch(host + '/admin/mails/delete', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        method: 'DELETE',
        body: JSON.stringify({
            id
        })
    })
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.message === 'success') {
                getMails();
            }
        })
        .catch(err => {
            console.log(err);
        });
};