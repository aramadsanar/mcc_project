const createDbConnection = require('../dbconnection/dbconnection');
const assert = require('assert').strict;


async function insertCourseData() {
    const dbConnection = await createDbConnection();

    let preloadedData = [
        [
            'Algorithm and Programming', 
            '[Algorithm Session 01] - IDE and I/O', 
            'https://www.youtube.com/embed/YvjMya_9RcA', 
            'Topics: - Typing code with syntax error - Compile, run, and debug program - Knowing data type and variable assignment - Creating a program using I/O syntax'
        ],
        [
            'Algorithm and Programming',
            '[Algorithm Session 02] - Arithmatic Operation',
            'https://www.youtube.com/embed/O_E_Jzje6IM',
            'Topic - Creating a program using arithmatic operation'
        ],
        [

            'Algorithm and Programming',
            '[Algorithm Session 03] - Repetition',
            'https://www.youtube.com/embed/GJ9vQ-CMb9M',
            'Topic: - Create a program using repetition structure control',
        ],
        [
            'Algorithm and Programming',
            '[Algorithm Session 05] - Selection',
            'https://www.youtube.com/embed/ETPxMBZCmng',
            'Topic - Create a program using selection control'
        ],
        [
            'Algorithm and Programming',
            '[Algorithm Session 05] - Array',
            'https://www.youtube.com/embed/RJkY-5hJq3k',
            'Topics: - Creating a modular program using array 1D - Creating a modular program using array 2D'
        ]
    ]

    let insertionQuery = `
        INSERT INTO \`courses\` (
            \`main_course_name\`, 
            \`course_name\`,
            \`link\`, 
            \`description\`
        ) VALUES ( ?,?,?,? )
    `;
    
    for (data of preloadedData) {
        try {
            //console.log(dbConnection.prepare(insertionQuery, data))
            await dbConnection.execute(insertionQuery, data);
        }
        catch (error) {
            console.log(error);
            process.exit(); //stop immediately
        }
    }

    const [dataRows, fields] = await dbConnection.execute('SELECT * FROM courses');
    //console.log(dataRows)
    let i = 0;
    for (dataRow of dataRows) {
        if (i < preloadedData.length) {
            let sourceRow = preloadedData[i];

            try {
                assert.equal(dataRow.main_course_name, sourceRow[0]);
                assert.equal(dataRow.course_name, sourceRow[1]);
                assert.equal(dataRow.link, sourceRow[2]);
                assert.equal(dataRow.description, sourceRow[3]);   
            }

            catch (error) {
                console.log(error);
                console.log('insertion failed. data may be corrupted!');

                process.exit();
            }

            i +=1 ;
        }
    }
    console.log('all clear');
    process.exit()
}

async function doMigration() {
    const dbConnection = await createDbConnection();



    let createCourseTableCommand = `
        CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            main_course_name VARCHAR(255) NOT NULL,
            course_name VARCHAR(255) NOT NULL,
            description VARCHAR(255),
            link VARCHAR(255) NOT NULL
        );
    `;

    let createUsersTableCommand = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fbid VARCHAR(255) UNIQUE,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255),
            password VARCHAR(255) NOT NULL
        )
    `;

    let createCourseHistoryTable = `
        CREATE TABLE IF NOT EXISTS course_history (
            user_id INT NOT NULL,
            course_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
    `;


    try {
        await dbConnection.execute(createCourseTableCommand);
        await dbConnection.execute(createUsersTableCommand);
        await dbConnection.execute(createCourseHistoryTable);
        console.log("migrated ok")
    } catch (error) {
       console.log(error.message); 
    }
}

async function resetData() {
    const dbConnection = await createDbConnection();
    try {
        await dbConnection.execute('SET FOREIGN_KEY_CHECKS=0');
        await dbConnection.execute('DROP TABLE IF EXISTS courses');
        await dbConnection.execute('DROP TABLE IF EXISTS users');
        await dbConnection.execute('DROP TABLE IF EXISTS course_history');
    }

    catch (error) {
        console.log(error);
        console.log('deletion failed');

        process.exit();
    }
    console.log('data dropped')
}

async function main() {
    if (process.argv.length === 3) {
        let option = process.argv[2];
        if (option === 'migrate') {
            await doMigration();
            await insertCourseData();
        }

        else if (option === 'insert-data') {
            await insertCourseData();
        }

        else if (option === 'reset') {
            await resetData();
            await doMigration();
            await insertCourseData();
        }
    }
}

main()
