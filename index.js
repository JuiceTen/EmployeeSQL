const mysql = require('mysql');
const inquirer = require('inquirer');
const table = require('console.table');
const pass = require('./config/password') // set up your own password connection
const nameArr = []


const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: pass,
    database: 'employeetracker'
});

const employeeName = () =>{ connection.query('SELECT first_name, last_name FROM employee', (err, res) => {
    if (err) throw err;
    res.forEach(({first_name, last_name}) => {
        empName = first_name + " " + last_name;
        console.log(first_name, last_name)
        nameArr.push(empName)
    });
});
}

const viewEmp = () => {
    connection.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        console.table(res);
        commandLine()
    })
}
const viewRole = () => {
    connection.query('SELECT title FROM role', (err, res) => {
        if (err) throw err;
        console.table(res);
        commandLine()
    })
}
const viewDepartment = () => {
    connection.query('SELECT name FROM department', (err, res) => {
        if (err) throw err;
        console.table(res)
        commandLine()
    })
}
const addRole = () => {
    inquirer
        .prompt([{
            type: 'input',
            name: 'role',
            message: 'Please enter employee role'
        },
        {
            type:'input',
            name: 'salary',
            message: 'What is the yearly salary?'
        },
        {
            type: 'input',
            name: 'deptID',
            message: 'what is the department id #?'
        }])
        .then(({role, salary, deptID}) => {
            connection.query('INSERT INTO role SET ?',
            {
                title: role,
                salary: salary,
                department_id: deptID
            },
            (err, res) => {
                if (err) throw err;
                console.log(res)
                commandLine()
            })
        })
}
async function addEmp() {
    const addName = await inquirer
    .prompt([{
        type: 'input',
        name: 'first_name',
        message: 'please enter the employee first name'
    },
    {
        type: 'input',
        name: 'last_name',
        message: 'please enter the employee last name'
    }]);
    connection.query('SELECT role.id, role.title FROM role', async (err, res) => {
        if (err) throw err;
        const addRole = await inquirer.prompt({
            type: 'list',
            name: 'role',
            message: `what is the employee's role?`,
            choices: () => res.map( res => res.title)
        });
        let roleid;
        for (const row of res) {
            if (row.title === addRole) {
                roleid = row.id;
                continue
            }
        }
    })
    connection.query('SELECT * FROM employee', async (err, res) => {
        if (err) throw err;
        let choices = res.map(res => `${res.first_name} ${res.last_name}`);
        choices.push('none');
        let addManager = await inquirer.prompt({
            type: 'list',
            name: 'manager',
            message: `who is this employee's manager?`,
            choices: choices
        });
        let managerid;
        let managerName;
        if (addManager === 'none') {
            managerid = null;
        } else {
            for (const data of res) {
                data.fullName = `${data.first_name} ${data.last_name}`;
                if (data.fullName === manager) {
                    managerid = data.id;
                    managerName = data.fullName;
                    console.log(managerid, managerName);
                    continue
                }
            }
        }
    })
        connection.query('INSERT INTO employee SET ?', 
        {first_name: addName.first_name, last_name: addName.last_name, role_id: roleid, manager_id: parseInt(managerid)},
        (err, res) => {
                if (err) throw err;
                console.log(res)
                commandLine()
            })
}
const addDept = () => {
    inquirer
        .prompt([{
            type: 'list',
            name: 'department',
            message: 'Which Department would you like to add?',
            choices: ['Sales', 'Legal', 'Engineer', 'Finance']
        },
       
    ])
        .then(({department}) => {
            
            connection.query('INSERT INTO department SET ?', {name: department}, (err, res) => {
                if (err) throw err;
                console.log(res)
                commandLine()
            })
        })
}
const commandLine = () => {
    inquirer
        .prompt([{
            type: 'rawlist',
            name: 'select',
            message: 'what would you like to do?',
            choices: ['View Employees', 'Add Employees', 'View Departments', 'Add Departments','View Roles', 'Add Roles', 'Update Employee Roles','Exit']
        }])
        .then(({select}) => {
            employeeName()
            console.log(nameArr)
            console.log(select)
            switch(select) {
                case 'View Employees':
                    viewEmp();
                    break;
                case 'View Departments':
                    viewDepartment();
                    break;
                case 'View Roles':
                    viewRole();
                    break;
                case 'Add Employees':
                    addEmp()
                    break;
                case 'Add Departments':
                    addDept()
                    break;
                case 'Add Roles':
                    addRole()
                    break;
                case 'Update Employee Roles':
                    break;
                case 'Exit':
                    connection.end();
                    break;
                default: 
                    console.log('please enter a valid response');
                    break;
            }
        })
}
connection.connect((err) => {
    if (err) throw err;
    console.log(`you are connected at ${connection.threadId}`);
    commandLine();
})
