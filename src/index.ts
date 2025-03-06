import { oauth2 } from "./oauth2";

async function startServer() {
	const s = await oauth2();
	s.listen(3000);
}

startServer();
