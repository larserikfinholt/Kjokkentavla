define([], function () {

    var users = [];
    var todos = [];

    function addUser(id, name, calendar) {
        var user = {};
        user.id = id;
        user.name = name;
        user.calendar = calendar;
        users.push(user);
    };

    function addTodo(id, title, userIdPerDay) {
        var todo = {}
        todo.id = id;
        todo.title = title;
        todo.userIds = userIdPerDay;
        todos.push(todo);
    };


    addUser(0, 'Lars Erik', 'lars.erik.finholt@gmail.com');
    addUser(1, 'Camilla','');
    addUser(2, 'Markus', '');
    addUser(3, 'Sigrid', '');
    addUser(4, 'Ingvild', '');

    addTodo(0, 'Gå tur med Buster', [[2,3], [3,2], [2,3], [2,3], [2,3], [], []]);
    addTodo(1, 'Lese 15 min', [[4], [4], [4], [4], [4], [4], [4]]);
    addTodo(2, 'Rydde 15 min på vaskerommet', [[0], [0], [0], [0], [0], [], [0]]);
    addTodo(3, 'Pakke gymtøy', [[], [4], [3], [], [2], [], []]);
    addTodo(4, 'Lage middag', [[0], [1], [0], [1], [0], [1], [0]]);
    addTodo(5, 'Vaske do', [[], [], [], [], [0], [], []]);


    return {
        id:1,
        familyName: 'finholt',
        users: users,
        todos: todos
    }

});