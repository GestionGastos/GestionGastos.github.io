const host = 'http://localhost:8080';
const token = localStorage.getItem('token');

// check the session
const currentPage = window.location.href;
let newPage = currentPage.replace("/admin/admin.html", "/login.html");
const isLogged = localStorage.getItem('isLogged');
const isAdmin = localStorage.getItem('isAdmin');

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
    if (selectElement.value === "es") {
        const newPage = currentPage.replace("/en", "/es");
        window.location.replace(newPage);
    }
});

// logout
const logoutButton = document.getElementById('logout');

const logoutFunction = () => {
    fetch(host + '/users/logout', {
        headers: {
            'Content-Type': 'application/json'
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
    fetch(host + '/admin/users/', {
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
                                    "<th>Name</th>" +
                                    "<th>Last Name</th>" +
                                    "<th>Username</th>" +
                                    "<th></th>" +
                                "<tr>" +
                            "</thead>" +
                            "<tbody>";
                    results.forEach(result => {
                        const id = result._id;
                        html += "<tr>" +
                                    "<td>" + id + "</td>" +
                                    "<td>" + result.email + "</td>" +
                                    "<td>" + result.name + "</td>" +
                                    "<td>" + result.lastname + "</td>" +
                                    "<td>" + result.username + "</td>" ;
                        if (result.deleted === false) {
                            html += "<td><button type='button' class='btn-delete-table' onclick='deleteUser(\"" + id + "\");'>Delete</button>";
                        } else {
                            html += "<td><button type='button' class='btn-table' onclick='enableUser(\"" + id + "\");'>Enable</button>";
                        }
                        html += "<tr>";
                    });
                    html += "</tbody>" +
                        "</table>";
                    jQuery("#users").html(html);
                    jQuery("#users-error").hide();
                } else {
                    jQuery("#users").html('');
                    jQuery("#users-error").show();
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
                            "<th>From</th>" +
                            "<th>Subject</th>" +
                            "<th>Message</th>" +
                            "<th></th>" +
                        "<tr>" +
                    "</thead>" +
                    "<tbody>";
                    results.forEach(result => {
                        const id = result._id;
                        html += "<tr>" +
                                "<td>" + id + "</td>" + 
                                "<td>" + result.from + "</td>" +
                                "<td>" + result.subject + "</td>" +
                                "<td>" + result.message + "</td>" +
                                "<td><button type='button' class='btn-delete-table' onclick='deleteMail(\"" + id + "\");'>Delete</button>" +
                            "<tr>";
                    });
                    html += "</tbody>" +
                        "</table>";

                    jQuery("#mails").html(html);
                    jQuery("#mails-error").hide();
                }
            } else {
                jQuery("#mails").html('');
                jQuery("#mails-error").show();
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