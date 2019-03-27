/**
 * В обьекте два поля - массив объектов прибылей и расходов.
 * В каждом массиве элемент - это объект из следующих полей
 * id - произвольная уникальная строка
 * type - маркер типа суммы (возможные значение "income", "expense")
 * description - описание суммы
 * value - сумма
 */

let storage = {
    current_list_income: [],
    current_list_expense: [],
};


// Объект с просуммированными данными об общей прибыли, расходе, и балансе
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


/**** Вспомогательные функции ****/
/**
 * generate_id - создает произвольную строку длины 10
 * @returns {string} - новый id
 */
const generate_id = () => {
    const words = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    let id = '0000000000'.split('').reduce( (prev, next) => prev + words[Math.floor(Math.random() * words.length)], '');
    return id;
}

/**
 * update_total_budgets - подсчитывает общую прибыль, расход, и баланс
 * @returns {Object} - объект со вычисленными значениями общих прибыли, расхода, и баланса
*/
const update_total_budgets = () => {
    allBudgets.incomeBudget = Math.round(storage.current_list_income.reduce( (prev, current) => prev += parseFloat(current.value), 0) * 100) / 100;
    allBudgets.expenseBudget = Math.round(storage.current_list_expense.reduce( (prev, current) => prev += parseFloat(current.value), 0) * 100 ) / 100 ;
    allBudgets.totalBudget = Math.round( (allBudgets.incomeBudget - allBudgets.expenseBudget) * 100) / 100 ;
    if (!allBudgets.totalBudget) allBudgets.totalBudget = 0;
    return allBudgets;
}

/**** Функции - обработчики событий ****/
/**
 * Изменение стилей при переключении типа суммы
*/
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

/**
 * Если была попытка неудачного сабмита формы (не заполнено хоть одно поле), обработка ситуации, когда в поле было введено значение. В случае, если все поля уже заполнены, также активируется кнопка сабмит.
*/
form.addEventListener('input', (e) => {
    if (e.target.classList.contains('red-transparent-background')) e.target.classList.remove('red-transparent-background');
    if (descriptionInput.value && valueInput.value) submitBtn.disabled = false;
});

/**
 * Сброс состояния формы после отправки
*/
form.addEventListener('reset', (e) => {
    if (typeSelect.classList.contains('red-focus')) typeSelect.classList.remove('red-focus');
    if (descriptionInput.classList.contains('red-focus')) descriptionInput.classList.remove('red-focus'); 
    if (valueInput.classList.contains('red-focus')) valueInput.classList.remove('red-focus');
    if (submitBtn.classList.contains('red')) submitBtn.classList.remove('red');
});

/**
 * Сабмит формы. Если хоть одно поле не заполнено, на нем добавляется красный фон, кнопка Сабмит становится неактивной. 
*/
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

/**
 * Удаление записи в таблице при клике на кнопку "удалить"
*/
budgetsList.addEventListener('click', (e) => {
    if (e.target.parentElement.parentElement.classList.contains('item__delete')){
        let idParent = e.target.closest('.item').getAttribute('id');
        delete_item(idParent);
    }
});

/**** Функции для работы с DOM ****/
/**
 * update_budget_template - обновляет общие балансы в разметке
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
 * add_new_item_template - добавление разметки новой записи в DOM страницы
 * @param {*} item - обьект записи, которую надо добавить в разметке
 */

const add_new_item_template = (item) => {
    const template = create_item_template(item);
    item.type === 'income' ? incomeList.insertAdjacentHTML("afterbegin", template) : expensesList.insertAdjacentHTML("afterbegin", template);
}

/**
 * create_item_template - создание разметки новой записи
 * @param {*} item - обьект записи, которую надо добавить в разметке
 * @returns {String} - разметка новой записи
 */
const create_item_template = (item) => {
    let sign = item.type === 'income' ? '+' : '-';
    return `
        <div class="item clearfix" id="${item.type}-${item.id}">
            <div class="item__description">${item.description}</div>
            <div class="right clearfix">
                <div class="item__value">${sign} ${item.value}</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>
    `;
}


/**
 * delete_item_from_html - удаление одной записи из таблицы в DOM страницы
 * @param {String} id - уникальный идентификатор
 * @param {*} id 
 */
const delete_item_from_html = id => {
    const target = document.querySelector(`#${id}`);
    const target_parent = target.parentElement;
    target_parent.removeChild(target);
}

/**** Функции для работы с данными и обновлением отображения ****/
/**
 * add_new_item - функция для добавления новой суммы
 * @param {String} description - описание суммы 
 * @param {String} value - сумма
 * @returns {Array} - массив всех записей
 */
const add_new_item = (description, value) => {
    if (!description) return console.log("Введите описание суммы.");
    if (!value) return console.log("Введите сумму.");
    const type = typeSelect.value;
    const new_item = { type, description, value, id: generate_id() };
    new_item.type === 'income' ? storage.current_list_income.push(new_item) : storage.current_list_expense.push(new_item);
    add_new_item_template(new_item);
    update_budget_template();

    return storage;
}

/**
 * delete_item - удаление одной записи
 * @param {String} id - уникальный идентификатор  
 * @returns {Array} - массив всех записей
 */
const delete_item = id => {
    if (!id) return console.log("Передайте id удаляемой суммы.");
    let type = id.slice(0, id.indexOf('-'));
    let idItem = id.slice(id.indexOf('-') + 1);
    
    if (!storage.current_list_income.some(item => item.id === idItem) && !storage.current_list_expense.some(item => item.id === idItem)) return console.log("Нет записи с таким id.");
    
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
 * Самовызывающаяся функция для инициализации данных при обновлении страницы
*/

(function initialState(){
    let currentDate = new Date();
    dateText.textContent = `${currentDate.toLocaleDateString('en-US', {year: 'numeric',
    month: 'long'})}`;
    update_budget_template();
})();
