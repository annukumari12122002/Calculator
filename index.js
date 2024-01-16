let btn = document.querySelector(".grid");
let calculationArea = document.querySelector(".expression");
let resultArea = document.querySelector(".result");
let mode = document.querySelector(".toggle");
let isDarkModeEnabled = false;

let expression = "";
let result = 0;
let toggle = 1;

let outputQueue = [];
let operatorStack = [];

const operator = ["+","-","x","/","%"];
const operand = ["0","1","2","3","4","5","6","7","8","9"];
// const commands = ["C","()","backspace"];

const operatorPrecedence = {
    "-": 0,
    "+": 1,
    "x": 2,
    "/": 3,
    "%": 4,
}

mode.addEventListener("click", () => {
    if(toggle){
        console.log(document.getElementById("stylesheet"));
        document.getElementById("stylesheet").href = "darkStyle.css";
        mode.innerHTML = '<i class="fa-solid fa-circle-half-stroke"></i>';
        toggle = !toggle;
        isDarkModeEnabled = true;
    }
    else{
        document.getElementById("stylesheet").href = "lightStyle.css";
        mode.innerHTML = '<i class="fas fa-moon fa-inverse toggler-icon"></i>';
        toggle = !toggle;
        isDarkModeEnabled = false;
    }
})

const clearScreen = () => {
    calculationArea.innerText = ""; resultArea.innerText = "";
    expression = ""; result = 0; 
    operatorStack = []; outputQueue = []; 
}

const backspace = () => {
    if(expression.length) expression = expression.slice(0,-1);
    operatorStack = []; outputQueue = []; 
    postFixExpression(1);
    updateScreen();
}

const updateScreen = () => {
    calculationArea.innerText = expression;
    if(expression === "") clearScreen();
}

const addition = (a,b) => a + b;
const subtraction = (a,b) => a - b;
const multiplication = (a,b) => a * b;
const division = (a,b) => a / b;
const modulo = (a,b) => a % b;

const postFixExpression = (backspaceEnabled) => {

    // Delete = sign 
    expression = expression.slice(0,-1);

    // operand value
    let outputParam = "";

    for(let val of expression){

        // opening bracket 
        if(val === "(") operatorStack.push(val);

        // operand
        for(let isOperand of operand){
            if(val === isOperand){
                outputParam += val;
            }
        }

        // operator
        for(let isOperator of operator){
            if(val === isOperator){
                // stack operations
                if(operatorStack.length === 0){
                    operatorStack.push(val);
                    if(outputParam !== "") outputQueue.push(outputParam);
                    outputParam = "";
                    continue;
                }

                let top = operatorStack[operatorStack.length - 1];
                if(operatorStack[operatorStack.length - 1] === "(") operatorStack.push(val);
                else{
                    
                    if(operatorPrecedence[val] >= operatorPrecedence[top]){
                        operatorStack.push(val);
                    }
                    else{
                        operatorStack = operatorStack.slice(0,-1);
                        operatorStack.push(val);
                        if(outputParam !== "") outputQueue.push(outputParam);
                        outputQueue.push(top); outputParam = "";
                    }
                }

                if(outputParam !== "") outputQueue.push(outputParam);
                outputParam = "";
            }
        }

        // closing bracket
        if(val === ")"){
            if(outputParam !== "") outputQueue.push(outputParam);
            outputParam = "";

            while(operatorStack[operatorStack.length - 1] !== "("){
                let top = operatorStack[operatorStack.length - 1];
                if(top !== "(" && top !== ")") outputQueue.push(top);
                operatorStack = operatorStack.slice(0,-1);
            }
        }

        // console.log("val ",val,"outputParam ",outputParam);
        // console.log("operator stack ",operatorStack);
        // console.log("output queue ",outputQueue);
    }

    // Last element of operation
    if(outputParam){
        if(outputParam !== "(" && outputParam !== ")") outputQueue.push(outputParam);
        outputParam = "";
    }

    // Remaining operators
    if(operatorStack.length){
        while(operatorStack.length){
            let top = operatorStack[operatorStack.length - 1];
            if(top !== "(" && top !== ")") outputQueue.push(top);

            operatorStack = operatorStack.slice(0,-1);
        }
    }

    // console.log(outputQueue);
    // console.log(operatorStack);
    if(!backspaceEnabled) evaluatePostfix();
    else{
        resultArea.innerText = "";
    }
}

const evaluatePostfix = () => {
    let outputStack = [];
    let error = false;

    for(let val of outputQueue){

        let isOperand = true;
        
        // value is operator
        for(let isOperator of operator){
            if(val === isOperator){
                // Error in postfix expression
                if(outputStack.length < 2){
                    error = true;
                    break;
                }
                else{
                    let operand1 = Number(outputStack[outputStack.length - 2]);
                    let operand2 = Number(outputStack[outputStack.length - 1]);
                    let res = 0;

                    // remove operands
                    outputStack = outputStack.slice(0,-2);

                    if(isOperator === "+") res = addition(operand1,operand2);
                    else if(isOperator === "-") res = subtraction(operand1,operand2);
                    else if(isOperator === "x") res = multiplication(operand1,operand2);
                    else if(isOperator === "/") res = division(operand1,operand2);
                    else res = modulo(operand1,operand2);

                    // add result
                    outputStack.push(res);
                }

                isOperand = false;
            }
        }

        if(isOperand) outputStack.push(val);

        if(error) break;
    }
    if(!error) result = outputStack[outputStack.length - 1];
    displayResult(error);
}

const displayResult = (error) => {
    if(error){
        calculationArea.innerText = "ERROR";
        calculationArea.style.color = "#D72852";
    }
    else{
        resultArea.innerText = `= ${result}`;
    }
}

btn.addEventListener("click", (e) => {
    let choice = e.target.closest("[data-choice]");

    // Change color from error to regular 
    if(isDarkModeEnabled) calculationArea.style.color = "#fff";
    else calculationArea.style.color = "#200819";

    if(choice){
        let userChoice = choice.dataset.choice;
        expression += userChoice;
    }

    let lastChar = expression[expression.length - 1];

    if(lastChar === "C") clearScreen();
    else if(lastChar === "B") backspace(); 
    else if(lastChar === "=") postFixExpression(0);
    else updateScreen();
})

