let isHealthy = false;
let token = '';
const currentPage = window.location.href;
var budget = {};
var budgets = [];
var contAE = 0;
var userInfo = {};
const host = 'http://localhost:8080';

const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Diciembre'
];

const checkAPI = () => {
    fetch(host + '/users/')
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.message === 'Healthy') {
                isHealthy = true;
                checkLogin();
                return true;
            }

            console.log("Error, the API is not running");
        })
        .catch(err => {
            const newPage = currentPage.replace("/index.html", "/login.html");
            window.location.replace(newPage);
        });
};

checkAPI();

const checkLogin = () => {
    localToken = localStorage.getItem('token');
    localIsLogged = localStorage.getItem('isLogged');
    localIsAdmin = localStorage.getItem('isAdmin');

    if (localIsLogged === null) {
        const newPage = currentPage.replace("/index.html", "/login.html");
        window.location.replace(newPage);
    } else {
        token = localToken;
        getBudgets();

        if (localIsAdmin === 'false') {
            const adminTag = document.getElementById('admin-tag');
            adminTag.style.display = 'none';
        }
    }
}

// logout
const logoutButton = document.getElementById('logout');

const logoutFunction = () => {
    fetch(host + '/users/logout', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            token: token
        })
    })
    .then(result => {
        return result.json();
    })
    .then(res => {
        if (res.message === 'success') {
            localStorage.removeItem('isLogged');
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            const newPage = currentPage.replace("/index.html", "/login.html");
            window.location.replace(newPage);
        }
    })
    .catch(err => {
        console.log(err);
    });
};

logoutButton.addEventListener('click', logoutFunction);


// Redirect to another language page
const selectElement = document.getElementById('select-language');

selectElement.addEventListener('change', () => {
    if (selectElement.value === "en") {
        const newPage = currentPage.replace("/es", "/en");
        window.location.replace(newPage);
    }
});

// Get Budget
const getBudgets = () => {
    fetch(host + '/budget/budgets', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        method: 'GET'
    })
        .then(result => {
            return result.json();
        })
        .then(res => {
            userInfo = res.user[0];
            jQuery("#username").html(userInfo.username);
            if (res.budgets.length > 0) {
                budgets = res.budgets;
                renderBudgets();
            } else {
                const errorBudgets = document.getElementById('budgets-error');
                errorBudgets.style.display = 'block';
            }
            getBudget();
        })
        .catch(err => {
            console.log();
        });
};

const renderBudgets = () => {
    const divBudgets = document.getElementById('budgets');
    for (let budget = 0; budget<budgets.length; budget++) {
        const div = document.createElement('div');
        div.className = 'budget';
        div.id = budgets[budget]._id;
        div.addEventListener('click', getBudgetById);
        const h4 = document.createElement('h4');
        h4.textContent = budgets[budget].month;

        div.append(h4);

        divBudgets.append(div);
    }
};

const getBudgetById = (event) => {
    const id = event.target.id;
    console.log(id);
    fetch(host + '/budget/budget/'+id, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+token
        },
        method: 'GET'
    })
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.budget) {
                budget = res.budget;
                renderBudget();
                renderGraphic();
                showBudget();
                return;
            }

            showEmpty();
        })
        .catch(err => {
            console.log(err);
        });
};

const getBudget = () => {
    fetch(host + '/budget/', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+token
        },
        method: 'GET'
    })
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.budget[0]) {
                budget = res.budget[0];
                renderBudget();
                renderGraphic();
                showBudget();
                return;
            }

            showEmpty();
        })
        .catch(err => {
            console.log(err);
        });
}

const showEmpty = () => {
    const empty = document.getElementById("empty-budgeting");
    const budget = document.getElementById("budgeting-main");

    empty.style.display = 'block';
    budget.style.display = 'none';

    const emptyBudget = document.getElementById('month-year-budget');
    const date = new Date();
    month = date.getMonth();
    year = date.getFullYear();
    emptyBudget.innerHTML = ' ' + months[month] + ' - ' + year;
};

const showBudget = () => {
    console.log('Here');
    const empty = document.getElementById("empty-budgeting");
    const budget = document.getElementById("budgeting-main");

    empty.style.display = 'none';
    budget.style.display = 'flex';
};

const renderBudget = (res) => {
    cleanBudget();

    const basicInformation = document.getElementById('basic-information');

    const year =  budget.year;
    const month = budget.month;
    const salary = budget.basics.salary;
    const save = budget.basics.save;
    const additionalIncome = budget.basics.additionalIncome;

    let currentAmount = +salary;

    const pDate = document.createElement('p');
    pDate.textContent = month+', '+year;

    basicInformation.append(pDate);

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    const trSalary = document.createElement('tr');
    const tdSalary = document.createElement('td');
    tdSalary.textContent = 'Salario';

    const tdSAmount = document.createElement('td');
    tdSAmount.textContent = salary;
    trSalary.append(tdSalary);
    trSalary.append(tdSAmount);
    tbody.append(trSalary);

    if (save !== '0') {
        const trSave = document.createElement('tr');
        const tdSave = document.createElement('td');
        tdSave.textContent = 'Ahorro';
        const tdAmount = document.createElement('td');
        tdAmount.textContent = save;
        
        trSave.append(tdSave);
        trSave.append(tdAmount);
        tbody.append(trSave);
        currentAmount = +currentAmount - +save;
    }

    if (additionalIncome !== '0') {
        const trIncome = document.createElement('tr');
        const tdIncome = document.createElement('td');
        tdIncome.textContent = 'Ingreso Adicional';
        const tdIAmount = document.createElement('td');
        tdIAmount.textContent = additionalIncome;
        trIncome.append(tdIncome);
        trIncome.append(tdIAmount);
        tbody.append(trIncome);
        currentAmount = +currentAmount + +additionalIncome;
    }
      
    const trCurrentAmount = document.createElement('tr');
    const tdCurrent = document.createElement('td');
    tdCurrent.textContent = 'Monto Disponible';
    const tdCurrentAmount = document.createElement('td');
    tdCurrentAmount.id= "amount";
    

    const expensesForm = document.getElementById('expenses-form');

    const expenses = budget.expenses;
    let expensesAmount = 0;
    for (let i=0; i<expenses.length; i++) {
        let divExpenses = document.createElement('div');
        divExpenses.className = "form-control";
        let labelExpenses = document.createElement('label'); 
        labelExpenses.htmlFor=expenses[i].expense.toLowerCase();
        labelExpenses.textContent = expenses[i].expense;
        let input = document.createElement('input'); 
        input.type = "number";
        input.id = expenses[i].expense.toLowerCase();
        input.name = "expense";
        input.value = expenses[i].amount;
        input.addEventListener('change', addexpense);
        
        divExpenses.append(labelExpenses);
        divExpenses.append(input);

        expensesForm.append(divExpenses);
        expensesAmount += +expenses[i].amount;
    }

    currentAmount = +currentAmount - +expensesAmount;

    // additional expenses
    const additionalExpenses = budget.additionals;
    let additionalExpensesAmount = 0;
    for (let additional = 0; additional<additionalExpenses.length; additional++) {
        const additionalExpensesTable = document.getElementById('form-additional-expenses');
        
        const div = document.createElement('div');
        div.className = 'form-control';
        const inputName = document.createElement('input');
        inputName.id = 'additional-expense-name-'+contAE;
        inputName.name = 'additional-expenses';
        inputName.placeholder = 'Expense';
        inputName.value = additionalExpenses[additional].name;
        
        const divAmount = document.createElement('div');
        divAmount.className = 'form-control';
        const inputAmount = document.createElement('input');
        inputAmount.id = 'additional-expense-input-'+contAE;
        inputAmount.name = 'additional-expenses-amount';
        inputAmount.type = 'number';
        inputAmount.placeholder = 'Amount';
        inputAmount.value = additionalExpenses[additional].amount;

        const divButton = document.createElement('div');
        const button = document.createElement('button');
        button.id = 'save-additional-expense-'+contAE;
        button.textContent = 'Edit';
        button.className = 'btn-plus';
        button.type = 'button';
        //button.addEventListener('click', saveAdditionalExpenses);
        button.addEventListener('click', editAdditionalExpenses);

        div.append(inputName);
        divAmount.append(inputAmount);
        divButton.append(button);

        const horizontalDiv = document.createElement('div');
        horizontalDiv.className = 'horizontal-form';

        horizontalDiv.append(div);
        horizontalDiv.append(divAmount);
        horizontalDiv.append(divButton);

        additionalExpensesTable.append(horizontalDiv);
        contAE++;
        additionalExpensesAmount += +additionalExpenses[additional].amount;
    }

    currentAmount = +currentAmount - +additionalExpensesAmount;

    tdCurrentAmount.textContent = currentAmount;
    trCurrentAmount.append(tdCurrent);
    trCurrentAmount.append(tdCurrentAmount);
    tbody.append(trCurrentAmount);

    table.append(tbody);

    basicInformation.append(table);

    const tagsSection = document.getElementById('tags-section');
    const tags = budget.tags;
    for (let tag = 0; tag < tags.length; tag++) {
        const a = document.createElement('a');
        a.textContent = tags[tag].tag;
        a.className = 'tags';
        a.addEventListener('click', addAdditionalItem);
        tagsSection.append(a);
    }
}

const renderGraphic = () => {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    const budgetData = [];
    let availableAmount = budget.basics.salary;
    if (budget.basics.additionalIncome !== '0') {
        availableAmount = +budget.basics.salary + +budget.basics.additionalIncome;
    }

    budgetData[0] = ['Item', 'amount'];

    let next = 2;
    if (budget.basics.save !== '0') {
        budgetData[next] = ['Ahorro', +budget.basics.save];
        availableAmount = +availableAmount - +budget.basics.save;
        next++;
    }

    const expenses = budget.expenses;
    for (let i = 0; i<expenses.length; i++) {
        if (expenses[i].amount !== '0') {
            budgetData[next] = [expenses[i].expense, +expenses[i].amount];
            availableAmount = +availableAmount - +expenses[i].amount;
            next++;
        }
    }

    if (budget.additionals) {
        const additionalExpenses = budget.additionals;
        for (let j = 0; j<additionalExpenses.length; j++) {
            budgetData[next] = [additionalExpenses[j].name, +additionalExpenses[j].amount];
            availableAmount = +availableAmount - +additionalExpenses[j].amount;
            next++;
        }
    }

    budgetData[1] = ['Monto Disponible', +availableAmount];
    console.log(budgetData);

    function drawChart() {

        var data = google.visualization.arrayToDataTable(budgetData);

        var options = {
            title: 'Presupuesto'
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
    }
}

const amount = document.getElementById('amount');
const addexpense = (event) => {
    value = event.target.value;
    expense = event.target.id;
    const actualAmount = +amount.textContent;
    newAmount = actualAmount - value;
    
    amount.innerHTML = newAmount;
    const expenses = budget.expenses;
    for (let i = 0; i<expenses.length; i++) {
        if (expenses[i].expense.toLowerCase() === expense) {
            budget.expenses[i].amount = value;
            break;
        }
    }
    updateBudget();
}

const addAdditionaExpense = document.getElementById('add-additional-expense');
const addAdditionalItem = (event) => {
    const additionalExpensesTable = document.getElementById('form-additional-expenses');
    
    const div = document.createElement('div');
    div.className = 'form-control';
    const inputName = document.createElement('input');
    inputName.id = 'additional-expense-name-'+contAE;
    inputName.name = 'additional-expenses';
    inputName.placeholder = 'Gasto';
    if (event) {
        if (event.target.textContent !== '+ Add Expense') {
            inputName.value = event.target.textContent;
        }
    }
    
    const divAmount = document.createElement('div');
    divAmount.className = 'form-control';
    const inputAmount = document.createElement('input');
    inputAmount.id = 'additional-expense-input-'+contAE;
    inputAmount.name = 'additional-expenses-amount';
    inputAmount.type = 'number';
    inputAmount.placeholder = 'Monto';

    const divButton = document.createElement('div');
    const button = document.createElement('button');
    button.id = 'save-additional-expense-'+contAE;
    button.textContent = '+';
    button.className = 'btn-plus';
    button.type = 'button';
    button.addEventListener('click', saveAdditionalExpenses);

    div.append(inputName);
    divAmount.append(inputAmount);
    divButton.append(button);

    const horizontalDiv = document.createElement('div');
    horizontalDiv.className = 'horizontal-form';

    horizontalDiv.append(div);
    horizontalDiv.append(divAmount);
    horizontalDiv.append(divButton);

    additionalExpensesTable.append(horizontalDiv);
    contAE++;
}
addAdditionaExpense.addEventListener('click', addAdditionalItem);

const createBudget = document.getElementById('create-budget');
const newBudgetModal = document.getElementById('new-budget-modal');
createBudget.addEventListener('click', () => {
    newBudgetModal.style.display = 'block';
});

const createBudgetButton = document.getElementById('create-new-budget');
createBudgetButton.addEventListener('click', () => {
    newBudgetModal.style.display = 'block';
});

// Check additional basic information
const checkSave = () => {
    const checkboxSave = document.getElementById('check-save');
    const saveField = document.getElementById('save-field');

    saveField.style.display = 'none';
    if (checkboxSave.checked) {
        saveField.style.display = 'block';
    }
};

const checkAdditionalIncome = () => {
    const checkboxAdditionalIncome = document.getElementById('check-additional-income');
    const additionalIncomeField = document.getElementById('additional-income-field');

    additionalIncomeField.style.display = 'none';
    if (checkboxAdditionalIncome.checked) {
        additionalIncomeField.style.display = 'block';
    }
}

// Buttons actions
const buttonNext = document.getElementById("button-next");
const budgeting = {};
let visitedExpenses = 0;
let visitedTags = 0;
buttonNext.addEventListener('click', async () => {
    const basicForm = document.getElementById('form-basic');
    const divFormExpenses = document.getElementById('div-form-expenses');
    const divFormTags = document.getElementById('div-form-tags');

    const basicItem = document.getElementById('basic-item');
    const expensesItem = document.getElementById('expenses-item');
    const tagsItem = document.getElementById('tags-item');

    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const salary = document.getElementById('salary').value;
    const checkboxSave = document.getElementById('check-save');
    const checkboxAdditionalIncome = document.getElementById('check-additional-income');
    const save = document.getElementById('save').value;
    const additionalIncome = document.getElementById('additional-income').value;

    const validate = validateBasicForm(year, month, salary, checkboxSave, checkboxAdditionalIncome, save, additionalIncome);

    if (validate !== '') {
        const basicErrorMessage = document.getElementById('basic-error');
        basicErrorMessage.style.display = 'block';
        basicErrorMessage.innerHTML = validate;
        return;
    }

    if (validate === '') {
        order = {
            enero: '1',
            febrero: '2',
            marzo: '3',
            abril: '4',
            mayo: '5',
            junio: '6',
            julio: '7',
            agosto: '8',
            septiembre: '9',
            octubre: '10',
            noviembre: '11',
            diciembre: '12'
        };

        budgeting.order = order[month.toLowerCase()];
        budgeting.year = year;
        budgeting.month = month;
        budgeting.basics = {
            salary,
            save,
            additionalIncome
        }
    }

    if (budgeting.basics && !budgeting.expenses) {
        basicForm.style.display = 'none';
        divFormExpenses.style.display = 'block';

        basicItem.removeAttribute('class');
        expensesItem.className = 'active';
        visitedExpenses++;
    }

    const expenses = document.getElementsByName('expenses');
    const amounts = document.getElementsByName('amounts');
    const newExpenses = validateExpensesForm(expenses, amounts);

    if (visitedExpenses > 1 && !newExpenses) {
        const expenseErrorMessage = document.getElementById('expense-error');
        expenseErrorMessage.style.display = 'block';
        expenseErrorMessage.innerHTML = 'Todos los campos son requeridos';
        return;
    }
    
    if (newExpenses) {
        budgeting.expenses = newExpenses;
    }

    if (budgeting.expenses && !budgeting.tags) {
        divFormExpenses.style.display = 'none';
        divFormTags.style.display = 'block';

        expensesItem.removeAttribute('class');
        tagsItem.className = 'active';
        visitedTags++;
    }

    const tags = document.getElementsByName('tags');
    const newTags = validateTagsForm(tags);

    if (visitedTags > 1 && !newTags) { 
        const tagsErrorMessage = document.getElementById('tags-error');
        tagsErrorMessage.style.display = 'block';
        tagsErrorMessage.innerHTML = 'All las eiquetas son requeridas';
        return;
    }

    if (newTags) {
        budgeting.tags = newTags;
    }

    if (budgeting.tags) {
        const response  = await fetch(host + '/budget/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(budgeting)
        });

        if (response.ok) {
            location.reload();
        } else {
            console.log(response);
        }
    }
});

const buttonCancel = document.getElementById('button-cancel');
buttonCancel.addEventListener('click', () => {
    newBudgetModal.style.display = 'none';
});

// Validate forms
const validateBasicForm = (year, month, salary, checkboxSave, checkboxAdditionalIncome, save, additionalIncome) => {
    if (year === '') {
        return "El año es requerido";
    }

    if (month === '') {
        return 'El mes es requerido';
    }

    if (salary === '0') {
        return 'El salario debe ser mayor a 0';
    }

    if (checkboxSave.checked) {
        if (save === '0') {
            return "El ahorro debe ser mayor a 0";
        }
    }

    if (checkboxAdditionalIncome.checked) {
        if (additionalIncome === '0') {
            return 'El ingreso adicional debe ser mayor a 0';
        }
    }

    return '';
}

const validateExpensesForm = (expenses, amounts) => {
    const newExpenses = [];
    for (let expense = 0; expense<expenses.length; expense++) {
        if (expenses[expense].value === '' || amounts[expense].value === '') {
            return false;
        }

        newExpenses[expense] = { expense: expenses[expense].value, amount: amounts[expense].value };
    }

    return newExpenses;
}

const validateTagsForm = (tags) => {
    const newTags = [];
    for (let tag = 0; tag<tags.length; tag++) {
        if (tags[tag].value === '') {
            return false;
        }

        newTags[tag] = { tag: tags[tag].value }
    }

    return newTags;
};

// Add additional items
const addExpenses = document.getElementById('add-expenses');
var contExpenses;
addExpenses.addEventListener('click', () =>{
    const formExpenses = document.getElementById('form-expenses');

    const div = document.createElement('div');
    div.className = 'form-control';
    const label = document.createElement('label');
    label.textContent = 'Gasto';
    label.htmlFor = 'expense-'+contExpenses;
    const input = document.createElement('input');
    input.id = 'expense-'+contExpenses;
    input.name = 'expenses';

    div.append(label);
    div.append(input);

    const divAmount = document.createElement('div');
    divAmount.className = 'form-control';
    const labelAmount = document.createElement('label');
    labelAmount.textContent = 'Monto';
    labelAmount.htmlFor = 'amount-'+contExpenses;
    const inputAmount = document.createElement('input');
    inputAmount.id = 'amount-'+contExpenses;
    inputAmount.name = 'amounts';
    inputAmount.type = 'number';

    divAmount.append(labelAmount);
    divAmount.append(inputAmount);

    const horizontalDiv = document.createElement('div');
    horizontalDiv.className = 'horizontal-form';

    horizontalDiv.append(div);
    horizontalDiv.append(divAmount);

    formExpenses.append(horizontalDiv);
});

const addTags = document.getElementById("add-tags");
addTags.addEventListener('click', () => {
    const formTags = document.getElementById("form-tags");

    const div = document.createElement('div'); 
    div.className = "form-control";
    const label = document.createElement('label'); 
    label.htmlFor = "tag";
    label.textContent = 'Etiqueta';
    const input = document.createElement('input'); 
    input.id = "tag";
    input.name = "tags";

    div.append(label);
    div.append(input);

    formTags.append(div);
});            

const updateBudget = async () => {
    const response = await fetch(host + '/budget/update/'+budget._id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+token
        },
        body: JSON.stringify(budget)
    });

    if (response.ok) {
        renderBudget();
        renderGraphic();
    } else {
        console.log(response);
    }
};

var contAdditionals = 0;
const saveAdditionalExpenses = (event) => {
    expenseNumber = event.target.id.split('-')[3];
    const name = document.getElementById('additional-expense-name-'+expenseNumber).value;
    const amount = document.getElementById('additional-expense-input-'+expenseNumber).value;

    budget.additionals[contAdditionals] = { name, amount }
    updateBudget();
    contAdditionals++;
};

const editAdditionalExpenses = () => {

}

// clean up
const cleanBudget = () => {
    const basicInformation = document.getElementById("basic-information");
    basicInformation.innerHTML = '';
    let h3 = document.createElement('h3');
    h3.textContent = 'Información Basica';
    basicInformation.append(h3);
    const expensesForm = document.getElementById("expenses-form");
    expensesForm.innerHTML = '';
    const tagsSection = document.getElementById("tags-section");
    tagsSection.innerHTML = '';
    h3 = document.createElement('h3');
    h3.textContent = 'Etiquetas';
    tagsSection.append(h3);
    const formAdditionalExpenses = document.getElementById("form-additional-expenses");
    formAdditionalExpenses.innerHTML = '';
};

// show modules
const hideModules = () => {
    jQuery("#second-part").html('');
    jQuery("#all-budgeting").hide();
    jQuery("#empty-budgeting").hide();
    jQuery("#budgeting-main").hide();
    jQuery("#edit-user-info").hide();
    jQuery("#contact-us-info").hide();
    jQuery("#frequent-questions-info").hide();
}

jQuery("#principal").on('click', () => {
    hideModules();
    jQuery("#all-budgeting").show();
    if (budgets.length > 0) {
        jQuery("#budgeting-main").show();
    }else {
        jQuery("#empty-budgeting").show();
    }
});

jQuery("#username").on('click', () => {
    hideModules();
    jQuery("#edit-user-info").show();
    jQuery("#second-part").html(' > Perfil');

    jQuery("#user-name").html(userInfo.name + ' ' + userInfo.lastname);
    jQuery("#name").val(userInfo.name);
    jQuery("#lastname").val(userInfo.lastname);
    jQuery("#username-form").val(userInfo.username);
    jQuery("#email").val(userInfo.email);
});

jQuery("#contact-us").on('click', () => {
    hideModules();
    jQuery("#contact-us-info").show();
    jQuery("#second-part").html(' > Contactanos');
});

jQuery("#frequent-questions").on('click', () => {
    hideModules();
    jQuery("#second-part").html(' > Preguntas Frecuentes');
    jQuery("#frequent-questions-info").show();
});

// show forms
const hideForms = () => {
    jQuery("#basic-form").hide();
    jQuery("#password-form").hide();
    jQuery("#setup-form").hide();
    jQuery("#delete-form").hide();
}

jQuery("#btn-user-info").on('click', () => {
    hideForms();
    jQuery("#basic-form").show();
});

jQuery("#btn-password").on('click', () => {
    hideForms();
    jQuery("#password-form").show();
});

jQuery("#btn-setup").on('click', () => {
    hideForms();
    jQuery("#setup-form").show(); 
});

jQuery("#btn-delete").on('click', () => {
    hideForms();
    jQuery("#delete-form").show();
});


// User updates
jQuery("#update-user-basic").on('click', () => {
    const name = jQuery("#name").val();
    const lastname = jQuery("#lastname").val();
    const username = jQuery("#username-form").val();
    const email = jQuery("#email").val();
    let validated = true;

    if (name === '') {
        jQuery("#label-error-name").show();
        validated = false;
    }

    if (lastname === '') {
        jQuery("#label-error-lastname").show();
        validated = false;
    }

    if (username === '') {
        jQuery("#label-error-username").show();
        validated = false;
    }

    if (email === '') {
        jQuery("#label-error-email").show();
        validated = false;
    }

    if (validated) {
        fetch(host + '/users/update_user', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token 
            },
            method: 'PUT',
            body: JSON.stringify({
                name,
                lastname,
                username,
                email
            })
        })
        .then(result => {
            return result.json();
        })
        .then(res => {
            console.log(res);
            jQuery("#label-success-basics").show();
        })
        .catch(err => {
            console.log(err);
        });
    }
});

jQuery("#update-user-password").on('click', () => {
    const currentPassword = jQuery("#current-password").val(); 
    const newPassword = jQuery("#new-password").val();
    const confirmPassword = jQuery("#confirm-password").val();
    let validated = true;

    if (currentPassword === '') {
        jQuery("#label-error-current-password").show();
        validated = false;
    }

    if (newPassword === '') {
        jQuery("#label-error-new-password").show();
        validated = false;
    }

    if (confirmPassword === '') {
        jQuery("#label-error-confirm-password").show();
        validated = false;
    }

    if (newPassword !== confirmPassword) {
        jQuery("#label-error-not-similar").show();
        validated = false;
    }

    if(validated) {
        fetch(host + '/users/update_password', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            method: 'PUT',
            body: JSON.stringify({
                email: userInfo.email,
                currentPassword,
                newPassword
            })
        })
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.message === 'success') {
                jQuery("#label-success-password").show();
            }
        })
        .catch(err => {
            console.log(err);
        });
    }
});

jQuery("#delete-account-btn").on('click', () => {
    fetch(host + '/users/delete', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        method: 'DELETE',
        body: JSON.stringify({
            email: userInfo.email
        })
    })
    .then(result => {
        return result.json();
    })
    .then(res => {
        if (res.message === 'success') {
            logoutFunction();
        }
    })
    .catch(err => {
        console.log(err);
    });
});

// show and hide answers
const hideAnswers = () => {
    jQuery("#first-question-answer").hide();
    jQuery("#second-question-answer").hide();
    jQuery("#third-question-answer").hide();
    jQuery("#fourth-question-answer").hide();
}

let firstQuestion = 0;
jQuery("#first-question").on('click', () => {
    hideAnswers();
    if (firstQuestion === 0) {
        jQuery("#first-question-answer").show();
        firstQuestion = 1;
    } else {
        firstQuestion = 0;
    }
});

let secondQuestion = 0;
jQuery("#second-question").on('click', () => {
    hideAnswers();
    if (secondQuestion === 0) {
        jQuery("#second-question-answer").show();
        secondQuestion = 1;
    } else {
        secondQuestion = 0;
    }
});

let thirdQuestion = 0;
jQuery("#third-question").on('click', () => {
    hideAnswers();
    if (thirdQuestion === 0) {
        jQuery("#third-question-answer").show();
        thirdQuestion = 1;
    } else {
        thirdQuestion = 0;
    }
});

let fourthQuestion = 0;
jQuery("#fourth-question").on('click', () => {
    hideAnswers();
    if (fourthQuestion === 0) {
        jQuery("#fourth-question-answer").show();
        fourthQuestion = 1;
    } else {
        fourthQuestion = 0;
    }
});

// contact us
jQuery("#send-message").on('click', () => {
    const email = jQuery("#user-email").val();
    const subject = jQuery("#subject").val();
    const message = jQuery("#message").val();
    let validated = true;

    if (email === '') {
        jQuery("#label-error-email-mail").show();
        validated = false;
    }

    if (subject === '') {
        jQuery("#label-error-subject").show();
        validated = false;
    }

    if (message === '') {
        jQuery("#label-error-message").show();
        validated = false;
    }

    if (validated) {
        fetch(host + '/users/send', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                email,
                subject,
                message
            })
        })
        .then(result => {
            return result.json();
        })
        .then(res => {
            if (res.message === 'success') {
                jQuery("#label-success-mail").show();
            }
        })
        .catch(err => {
            console.log(err);
        });
    }
});