const CREDENTIALS_REGEXP =
	/^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;

const USER_PASS_REGEXP = /^([^:]*):(.*)$/;

export function parseBasicAuth(str: string) {
	const match = CREDENTIALS_REGEXP.exec(str);

	if (!match) {
		return undefined;
	}

	const userPass = USER_PASS_REGEXP.exec(atob(match[1]));

	if (!userPass) {
		return undefined;
	}

	return { name: userPass[1], pass: userPass[2] };
}
