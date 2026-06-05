const currentPage = window.location.href;

// When the document is ready
jQuery('document').ready(function() {
    showForm();
});

const showForm = () => {
    setTimeout(() => {
        jQuery('#login-form').fadeIn();
    }, 2000);
}

jQuery("#send").on('click', () => {});

jQuery("#back").on('click', () => {
    const newPage = currentPage.replace("/forgot-password.html", "/login.html");
    location.href= newPage;
});