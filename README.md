# KanbanBackend
api rest en node

|Rutas  |    requieren {headers:{token}} |  retornan en caso de error status:400 {message:""} |
|---|---|----|


  /board

   |Accion                     |    Requiere                                  |        Retorna |
   | -------------             | ---------------                              | --------------- |
   |.get(/:boardTitle)         |                                              |   { tables: [...], title: boardTitle} status:200 |
   |.post(/)                   |      ({body:{boardTitle:""}} )               |   { tables: [], title: boardTitle} status:201 |
   |.post(/table)              | ({body:{boardTitle:"",tableTitle:""}})       |   { tables: [...,{ titleTable: titleTable, content: []}], title: boardTitle} status:201 |
   |.post(/table/Task)         | ({body:{boardTitle:"",tableTitle:"", task:{}}})       |   {tables: [...,{ titleTable: titleTable, content[{task}]}], title: boardTitle} status:201 |
   |.delete(/:boardTitle)      |                                              |   {} status:204                          |
   |.delete(/table)            |    {body:{boardTitle:"",tableTitle:""}}      |   {} status:204                          |
   |.delete(/table/task)       |    {body:{boardTitle:"",tableTitle:"", taskTitle:""}}| {} status:204                    |
   |.patch(/table)             | {body:{boardTitle:"",tasktitle:"", tabletFrom :"", tabletTo :"", indexTo: int}} | {boardTitle:"", oldTables:[], tables:[]} status:200 |
   |.patch(/table/task)        |  {body:{boardTitle:"", taskTitleToRemove:"", newTask:{}, tableTitle:""}} | {boardTitle:"", tables:[]} status:200|
   
                
----
 /user
 
   |Accion          |    Requiere   |        Retorna |
   | ------------- | --------------- | --------------- |
   |.get(/:userName)    |               |         { userName: userName, boards: []} status:200 |
   |.post(/register)      |   ({body:{userName:"", password:""}})  |  { userName: userName, boards: []} status:201|
   |.post(/login)         |   ({body:{userName:"", password:""}})  |    {token : "Bearer ..."}    status:200
