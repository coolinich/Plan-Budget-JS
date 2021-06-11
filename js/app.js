let storage = {
    current_list_income: [],
    current_list_expense: [],
};

let allBudgets = {
    totalBudget: 0,
    incomeBudget: 0,
    expenseBudget: 0
}

// UI Elements
const incomeList = document.querySelector(".income .income__list");
const expensesList = document.querySelector(".expenses .expenses__list");
const budgetsList = document.querySelector('.container.clearfix');
const totalBudget = document.querySelector('.budget__value');
const incomeBudget = document.querySelector('.budget__income--value');
const expenseBudget = document.querySelector('.budget__expenses--value');
const dateText = document.querySelector('.budget__title--month');
let typeSelect = document.querySelector('select');
let typeExpense = document.querySelector('select.add__type option[value="expense"]');
let typeIncome = document.querySelector('select.add__type option[value="income"]');
const submitBtn = document.querySelector('.add__btn');
const form = document.forms['add-item-form'];
const descriptionInput = form.querySelector('.add__description');
const valueInput = form.querySelector('.add__value');


/**** Utility functions ****/
/**
 * generate_id - generate string of 10 ranndom symbols to use as id of records
 * @returns {string} - new id
 */
const generate_id = () => {
    const words = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    let id = '0000000000'.split('').reduce( (prev, next) => prev + words[Math.floor(Math.random() * words.length)], '');
    return id;
}

/**
 * update_total_budgets - function to calculate income, expense and total budgets
 * @returns {Object} - object of calculated income, expense and total budgets
*/
const update_total_budgets = () => {
    allBudgets.incomeBudget = Math.round(storage.current_list_income.reduce( (prev, current) => prev += parseFloat(current.value), 0) * 100) / 100;
    allBudgets.expenseBudget = Math.round(storage.current_list_expense.reduce( (prev, current) => prev += parseFloat(current.value), 0) * 100 ) / 100 ;
    allBudgets.totalBudget = Math.round( (allBudgets.incomeBudget - allBudgets.expenseBudget) * 100) / 100 ;
    if (!allBudgets.totalBudget) allBudgets.totalBudget = 0;
    return allBudgets;
}

/**** Event listeners ****/

typeSelect.addEventListener('change', (e) => {
   switch (e.target.value) {
       case 'expense':
           typeSelect.classList.add('red-focus');
           descriptionInput.classList.add('red-focus'); 
           valueInput.classList.add('red-focus');
           submitBtn.classList.add('red');
           break;
       case 'income':
           if (typeSelect.classList.contains('red-focus')) typeSelect.classList.remove('red-focus');
           if (descriptionInput.classList.contains('red-focus')) descriptionInput.classList.remove('red-focus'); 
           if (valueInput.classList.contains('red-focus')) valueInput.classList.remove('red-focus');
           if (submitBtn.classList.contains('red')) submitBtn.classList.remove('red');
   }
});

form.addEventListener('input', (e) => {
    if (e.target.classList.contains('red-transparent-background')) e.target.classList.remove('red-transparent-background');
    if (descriptionInput.value && valueInput.value) submitBtn.disabled = false;
});

form.addEventListener('reset', (e) => {
    if (typeSelect.classList.contains('red-focus')) typeSelect.classList.remove('red-focus');
    if (descriptionInput.classList.contains('red-focus')) descriptionInput.classList.remove('red-focus'); 
    if (valueInput.classList.contains('red-focus')) valueInput.classList.remove('red-focus');
    if (submitBtn.classList.contains('red')) submitBtn.classList.remove('red');
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!descriptionInput.value || !valueInput.value) {
        if (!descriptionInput.value) descriptionInput.classList.add('red-transparent-background'); 
        if (!valueInput.value) valueInput.classList.add('red-transparent-background');
        submitBtn.disabled = true;
        return;
    }

    add_new_item(descriptionInput.value, valueInput.value);
    form.reset();
})

budgetsList.addEventListener('click', (e) => {
    if (e.target.parentElement.parentElement.classList.contains('item__delete')){
        let idParent = e.target.closest('.item').getAttribute('id');
        delete_item(idParent);
    }
});

/**** Functions to work with DOM ****/
/**
 * update_budget_template - function to refresh budgets in layout
*/
const update_budget_template = () => {
    update_total_budgets();
    incomeBudget.textContent = allBudgets.incomeBudget  ? `+ ${allBudgets.incomeBudget}` : `${allBudgets.incomeBudget}`;
    expenseBudget.textContent = allBudgets.expenseBudget ? `- ${allBudgets.expenseBudget}` : `${allBudgets.expenseBudget}`;
    if (allBudgets.totalBudget > 0) totalBudget.textContent = `+ ${allBudgets.totalBudget}`;
    else if (allBudgets.totalBudget < 0) totalBudget.textContent = `- ${Math.abs(allBudgets.totalBudget)}`;
    else totalBudget.textContent = allBudgets.totalBudget;
}


/**
 * add_new_item_template - add template of new record to page DOM
 * @param {*} item - object of record to be added
 */

const add_new_item_template = (item) => {
    const template = create_item_template(item);
    item.type === 'income' ? incomeList.insertAdjacentHTML("afterbegin", template) : expensesList.insertAdjacentHTML("afterbegin", template);
}

/**
 * create_item_template - create layout of record to be added
 * @param {*} item - object of record to be added
 * @returns {String} - layout of record to be added
 */
const create_item_template = (item) => {
    let sign = item.type === 'income' ? '+' : '-';
    return `
        <div class="item clearfix" id="${item.type}-${item.id}">
            <div class="item__description">${item.description}</div>
            <div class="right clearfix">
                <div class="item__value">${sign} ${+item.value}</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>
    `;
}


/**
 * delete_item_from_html - remove one item from the list in DOM
 * @param {String} id - unique identifier of the item
 * @param {*} id 
 */
const delete_item_from_html = id => {
    const target = document.querySelector(`#${id}`);
    const target_parent = target.parentElement;
    target_parent.removeChild(target);
}

/**** Functions for data handling ****/
/**
 * add_new_item - add new item
 * @param {String} description - amount description 
 * @param {String} value - amount
 * @returns {Array} - array of all records
 */
const add_new_item = (description, value) => {
    if (!description || !value) return;
    const type = typeSelect.value;
    const new_item = { type, description, value, id: generate_id() };
    new_item.type === 'income' ? storage.current_list_income.push(new_item) : storage.current_list_expense.push(new_item);
    add_new_item_template(new_item);
    update_budget_template();
    return storage;
}

/**
 * delete_item - delete one item from the list
 * @param {String} id - unique indentifier of the item
 * @returns {Array} - array of all records
 */
const delete_item = id => {
    if (!id) return console.log("Specify id of item to be removed");
    let type = id.slice(0, id.indexOf('-'));
    let idItem = id.slice(id.indexOf('-') + 1);
    
    if (!storage.current_list_income.some(item => item.id === idItem) && !storage.current_list_expense.some(item => item.id === idItem)) return console.log("No record with such id.");
    
    if (type === 'income') {
        storage.current_list_income = storage.current_list_income.filter(item => item.id !== idItem);
    }
    if (type === 'expense') {
        storage.current_list_expense = storage.current_list_expense.filter(item => item.id !== idItem);
    }
   
    delete_item_from_html(id);
    update_budget_template();

    return storage;
}

/**
 * Self-invocing function to set initial data after page load
*/

(function initialState(){
    let currentDate = new Date();
    dateText.textContent = `${currentDate.toLocaleDateString('en-US', {year: 'numeric', month: 'long'})}`;
    update_budget_template();
})();
