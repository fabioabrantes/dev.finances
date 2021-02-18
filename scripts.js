const Modal = {
  openModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.classList.add('active');
  },
  closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.classList.remove('active');
  }
};

const Mask = {
  apply(input, func) {
    input.value = Mask[func](input.value);
  },
  formatBRL(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value.replace(/\D/g, "") / 100);
  },
};

const Util={
   formatDate(value){
    const splittedDate = value.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  }
}

/* const transactions = [
  {
    id: 1,
    description: 'Luz',
    typeTransaction: 'expense',
    amount: "R$ 500,00",
    date: '23/01/2021'
  },
  {
    id: 2,
    description: 'Criação Website',
    typeTransaction: 'income',
    amount: "R$ 5.000,00",
    date: '23/01/2021'
  },
  {
    id: 3,
    description: 'Internet',
    typeTransaction: 'expense',
    amount: "R$ 200,00",
    date: '23/01/2021'
  },
]; */

const DataPersistentLocal = {
  getStorage(){
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  setStorage(transactions){
    localStorage.setItem("dev.finances:transactions",JSON.stringify(transactions));
  }
}

const Transaction = {
  allTransactions: DataPersistentLocal.getStorage(),
  add(transaction){
    this.allTransactions.push(transaction);
    App.reload();
  },
  remove(index){
    this.allTransactions.splice(index,1);
    App.reload();
  },
  incomes() {
    let income= 0;
    this.allTransactions.forEach((transaction)=>{
      if(transaction.typeTransaction === 'income'){
        income += Number(transaction.amount.replace(/\D/g,""));
      }
    });
    return income;
  },
  expenses() {
    let expense= 0;
    this.allTransactions.forEach((transaction)=>{
      if(transaction.typeTransaction === 'expense'){
        expense += Number(transaction.amount.replace(/\D/g,""));
      }
    });
    return expense;
  },
  total() {
    return Transaction.incomes() - Transaction.expenses();
  }
};

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  addTransaction(transaction,index){
    const tr = document.createElement('tr');
    tr.innerHTML = this.innerHTMLTransaction(transaction,index);
    tr.dataset.index = index;
    this.transactionsContainer.appendChild(tr);

  },
  innerHTMLTransaction(transaction,index) {
    const CSSclass = transaction.typeTransaction;
    let amountFormatted = Mask.formatBRL(transaction.amount);
    if(CSSclass === 'expense'){
      amountFormatted = '-' + amountFormatted;
    }else{
      amountFormatted = '+' + amountFormatted;

    }
    const html = `
            <tr>
              <td class="description">${transaction.description}</td>
              <td class="${CSSclass}">${amountFormatted}</td>
              <td class="date">${transaction.date}</td>
              <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
              </td>
          </tr>`;
    return html;

  },
  createTableTransactions(transactions){
    transactions.forEach((transaction,index)=>{
      this.addTransaction(transaction,index);
    });
  },
  updateBalance(){
    // Entradas
    document
    .getElementById('incomeDisplay')
    .innerHTML = "+" + Mask.formatBRL(String(Transaction.incomes()));

    //Saídas
    document
    .getElementById('expenseDisplay')
    .innerHTML = "-" + Mask.formatBRL(String(Transaction.expenses()) );

    //Total
    document
    .getElementById('totalDisplay')
    .innerHTML = Mask.formatBRL(String(Transaction.total()) );

  },
  clearTransactions(){
    DOM.transactionsContainer.innerHTML="";
  }
}

const Form = {
  inputDescription: document.querySelector('input#description'),
  inputTypeTransaction: document.querySelector('select#typeTransaction'),
  inputAmount: document.querySelector('input#amount'),
  inputDate: document.querySelector('input#date'),
  getValues(){
    return {
      description:this.inputDescription.value,
      typeTransaction: this.inputTypeTransaction.value,
      amount: this.inputAmount.value,
      date:this.inputDate.value
    }
  },
  validateFields(){
    const {description, typeTransaction,amount,date} = this.getValues();
    if(description.trim() ===""||typeTransaction.trim() ===""
    || amount.trim() === "" || date.trim() == ""){
      throw new Error("Por favor preencha todos os campos");
    }
},
  formatData(){
    let {description, typeTransaction,amount,date} = this.getValues();
    date = Util.formatDate(date);
    return {
      description,
      typeTransaction,
      amount,
      date
    }
  },
  save(transaction){
    Transaction.add(transaction);
  },
  clearFields(){
    this.inputDescription.value ="";
    this.inputTypeTransaction.value ="";
    this.inputAmount.value ="";
    this.inputDate.value ="";
  },
  submit(event){
    event.preventDefault();
    try {
      this.validateFields();
      const transaction = this.formatData();
      this.save(transaction);
      this.clearFields();
      Modal.closeModal();
    } catch (error) {
      alert("Error: " + error.message);
    }
    
  }
}

const App = {
  init(){
    DOM.createTableTransactions(Transaction.allTransactions);
    DOM.updateBalance();

    DataPersistentLocal.setStorage(Transaction.allTransactions);
  },
  reload(){
    DOM.clearTransactions();
    this.init();
  }
}
App.init();




