(async () => {

  try {

    const { makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = await import("@whiskeysockets/baileys");

    const fs = await import('fs');

    const pino = (await import('pino')).default;



    const rl = (await import("readline")).createInterface({ input: process.stdin, output: process.stdout });

    const question = (text) => new Promise((resolve) => rl.question(text, resolve));



    // ANSI color codes

    const reset = "\x1b[0m"; // Reset to default

    const green = "\x1b[1;32m"; // Green

    const yellow = "\x1b[1;33m"; // Yellow



    // Logo

    const logo = `${green}

....###....##....##.##.....##..######..##.....##

...##.##....##..##..##.....##.##....##.##.....##

..##...##....####...##.....##.##.......##.....##

.##.....##....##....##.....##..######..#########

.#########....##....##.....##.......##.##.....##

.##.....##....##....##.....##.##....##.##.....##

.##.....##....##     #######...######..##.....##                                                                                                             

============================================

[~] Author  : SAMAR INSIDE 

[~] GitHub  : samarinside143

[~] Tool  : Automatic WhatsApp Massage Sender

============================================`;



    // Function to clear the terminal screen and display the logo

    const clearScreen = () => {

      console.clear();

      console.log(logo);

    };



    // Variables to store input data

    let targetNumber = null;

    let messages = null;

    let intervalTime = null;

    let haterName = null;



    // Using multi-file auth state

    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');



    // Function to send messages in sequence

    async function sendMessages(MznKing) {

      while (true) { // Infinite loop for continuous sending

        for (const message of messages) {

          try {

            // Get the current time

            const currentTime = new Date().toLocaleTimeString();



            // Combine hater name with the message

            const fullMessage = `${haterName} ${message}`;



            // Send the message

            await MznKing.sendMessage(targetNumber + '@c.us', { text: fullMessage });



            // Log the message details

            console.log(`${green}Target Number => ${reset}${targetNumber}`);

            console.log(`${green}Time => ${reset}${currentTime}`);

            console.log(`${green}Message => ${reset}${fullMessage}`);

            console.log('    [ =============== TEDDY KING =============== ]');



            // Wait for the specified delay before sending the next message

            await delay(intervalTime * 1000);

          } catch (sendError) {

            console.log(`${yellow}Error sending message: ${sendError.message}. Retrying...${reset}`);

            await delay(5000); // Wait before retrying

          }

        }

      }

    }



    // Function to connect to WhatsApp

    const connectToWhatsApp = async () => {

      const MznKing = makeWASocket({

        logger: pino({ level: 'silent' }),

        auth: state,

        browser: ["Ubuntu", "Chrome", "20.0.04"], // Added browser configuration to bypass device link restriction

      });



      // Prompt for pairing code if not already defined

      if (!MznKing.authState.creds.registered) {

        clearScreen();

        let phoneNumber = await question(`${green}[+] Enter Your Phone Number (e.g. 919876543210) => ${reset}`);

        

        // Remove +, spaces, and any non-digit characters from the phone number

        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');



        console.log(`${yellow}[~] Connecting to WhatsApp servers, please wait...${reset}`);

        await delay(4000); // 4 seconds delay to establish stable socket connection before requesting code



        try {

          const pairingCode = await MznKing.requestPairingCode(phoneNumber); // Request pairing code

          clearScreen();

          console.log(`${green}[√] Your Pairing Code Is => ${reset}${pairingCode}`);

        } catch (err) {

          console.log(`${yellow}[!] Error getting pairing code: ${err.message}${reset}`);

        }

      }



      // Connection updates

      MznKing.ev.on("connection.update", async (s) => {

        const { connection, lastDisconnect } = s;



        if (connection === "open") {

          clearScreen();

          console.log(`${green}[Your WhatsApp Login ✓]${reset}`);



          // Ask for input once

          if (!targetNumber || !messages || !intervalTime || !haterName) {

            targetNumber = await question(`${green}[+] Enter Target Number => ${reset}`);

            const messageFilePath = await question(`${green}[+] Enter Message File Path => ${reset}`);

            messages = fs.readFileSync(messageFilePath, 'utf-8').split('\n').filter(Boolean);

            haterName = await question(`${green}[+] Enter Hater Name => ${reset}`);

            intervalTime = await question(`${green}[+] Enter Message Delay => ${reset}`);



            // Confirm details before starting

            console.log(`${green}All Details Are Filled Correctly${reset}`);

            clearScreen();

            console.log(`${green}Now Start Message Sending.......${reset}`);

            console.log('    [ =============== TEDDY KING  =============== ]');

            console.log('');



            // Start sending messages continuously

            await sendMessages(MznKing);

          }

        }



        // Handle network issues and reconnect

        if (connection === "close" && lastDisconnect?.error) {

          const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

          if (shouldReconnect) {

            console.log("Network issue, retrying in 5 seconds...");

            setTimeout(connectToWhatsApp, 5000);

          } else {

            console.log("Connection closed. Please restart the script.");

          }

        }

      });



      MznKing.ev.on('creds.update', saveCreds);

    };



    // Initial connection

    await connectToWhatsApp();



    // Handle uncaught exceptions

    process.on('uncaughtException', function (err) {

      let e = String(err);

      if (e.includes("Socket connection timeout") || e.includes("rate-overlimit")) return;

      console.log('Caught exception: ', err);

    });



  } catch (error) {

    console.error("Error importing modules:", error);

  }

})();
