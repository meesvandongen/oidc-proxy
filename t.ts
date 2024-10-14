console.log(await crypto.subtle.importKey("jwk", {
  "p": "9O1ZvlhCuO-lYaP9Hrcw9kqLJ6lJcCT5ki3KOE7untM-GLhvwZCM8YkUeuTYNr8EE7B98v4X13cgBFWZqOiE5w",
  "kty": "RSA",
  "q": "hkqDzZn3ZmDYRbmxhOIE8LnFZZSAycCl1tUwWaKho9nB_-GAz8GOgyZNPQGCOt9bqitaZAxWtFnynL7mgbEQvQ",
  "d": "G4pfK2yUTSBNUrXa0ugXTYS_ZxP4PdonmUKJbRfbewfFoRYR9dVKAi8nT6JDLBtyfn-2kPR1x3xf2GhvCwxBcJcn_anvaWJMkiNxpNV3Xb0yJdQwyUxBngz-74aS1BQKXQMsLUSYU6OEah_zLDGlLTkr0jG-qmppgslqQ3q5uwE",
  "e": "AQAB",
  "qi": "aseQJG2zgUUHFI1IxhRPj2U-enWHQAA1KAaIcqH1cTzutgB15nKy4a3wqAMVpJ4efKwd-VXmsuhpjuaddKqYJA",
  "dp": "tx0AfGt2LteUGITHCADDzU777IIHEp3CLMSpLCHvCrU59rdlbhzJEwd-VUbkU0HKJYJNF69aWc-JE1SAFiUIvw",
  "dq": "hkKld79BO5gDYeJ_eq1F5y60DhTkldEHfLvz9QnFtT0W2i6oTA3l33VBr4Z8n0OEL6PcYT58yR9Mki3B41QVuQ",
  "n": "gHuHr72EQkVK_SRmyvyv64Sb6jGOB1U9AC9ImDlN5vvuFX947Xi1M8ZxG5ULV3JFSKQ_SIK_MnstR-ClYncwWWasSlaJB7YqYDSOO-OszeT5SkCttS3ZkIPIBJV8QRP-84N76nVuii1lkjLk0z4JEZH_CnIsLyYhNDaaRoavjos"
}, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, [
  "verify",
]))