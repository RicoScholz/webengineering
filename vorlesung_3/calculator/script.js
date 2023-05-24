const currentResult = document.querySelector('#result');

function appendNumber(number) {
    currentResult.value += number;
}

function appendOperator(operator) {
    currentResult.value += operator;
}

function calculate() {
    currentResult.value = eval(currentResult.value);
}

function clearResult() {
    currentResult.value = '';
}
