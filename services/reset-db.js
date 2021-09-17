const DB = require("./services/db");
const { room, user, msg } = DB.getdbs();

try {
  DB.writeDB(room, [
    {
      name: "Public",
      password: "",
      public: true,
      users: [],
    },
    { name: "Educational", password: "", public: true, users: [] },
    { name: "Gaming", password: "", public: true, users: [] },
  ]);
  DB.writeDB(user, []);
  DB.writeDB(msg, []);
} catch (e) {
  console.error(e);
}
