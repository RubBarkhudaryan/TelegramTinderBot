const {HtmlTelegramBot, userInfoToString} = require("./bot");
const ChatGptService = require("./gpt");

class MyTelegramBot extends HtmlTelegramBot {

    constructor(token) {
        super(token);
        this.mode = null;
        this.list = [];
        this.user = {};
        this.count = 0;
    }

    async start(msg) {
        this.mode = "main";
        const text = this.loadMessage("main");
        await this.sendImage("main");
        await this.sendText(text);

        await this.showMainMenu({
            "start": "Главное меню бота",
            "profile": "Генерация Tinder-профиля 😎",
            "opener": "Сообщение для знакомства 🥰",
            "message": "Переписка от вашего имени 😈",
            "date": "Переписка со звездами 🔥",
            "gpt": "Задать вопрос чату GPT 🧠",
            "html": "Демонстрация HTML"
        });
    }

    async html(msg) {
        await this.sendHTML(`<h3 style='color: #1558b0'> Привет! </h3>`);
        const html = this.loadHtml("main");
        await this.sendHTML(html, {theme: "dark"});
    }

    async gpt(msg) {
        this.mode = "gpt";
        await this.sendImage("gpt");
        const text = this.loadMessage("gpt");
        await this.sendText("Пообщаемся с ИИ");
    }

    async date(msg){
        this.mode = "date";
        await this.sendImage("date");
        const text = this.loadMessage("date");
        await this.sendTextButtons(text, {
            "date_grande":"Ариана Гранде",
            "date_robbie":"Марго Робби",
            "date_zendaya":"Зендея",
            "date_gosling":"Райан Гослинг",
            "date_hardy":"Тмо Харди",
        });
    }

    async dateButton(callbackQuery){
        const query = callbackQuery.data;
        await this.sendImage(query);
        const prompt = this.loadPrompt(query);
        chatGPT.setPrompt(prompt);
    }

    async dateDialogue(msg){
        const text = msg.text;
        const myMessage = await this.sendText("Печатает...");
        const answer = await chatGPT.addMessage(text);
        await this.editText(myMessage,answer);
    }

    async message(msg){
        this.mode = "message";
        const text = this.loadMessage("message");
        await this.sendImage("message");

        await this.sendTextButtons(text,{
            "message_next":"Следующее сообщение",
            "message_date":"Пригласить на свидание"
        });

        this.list = [];
    }

    async messageButton(callbackQuery){
        const query = callbackQuery.data;
        const prompt = this.loadPrompt(query);
        const userChatHistory = this.list.join("\n\n")
        const myMessage = await this.sendText("ChatGPT думает над вариантом...");

        const answer = await chatGPT.sendQuestion(prompt, userChatHistory);
        await this.editText(myMessage, answer);
    }

    async messageDialogue(msg){
        const text = msg.text;
        this.list.push(text);
    }

    async profile(msg){
        this.mode = "profile";
        await this.sendImage("profile");
        const text = this.loadMessage("profile");
        await this.sendText(text);
        this.user = {};
        this.count = 0;
        await this.sendText("Сколько вам лет?");
    }

    async profileDialogue(msg){
        const text = msg.text;
        this.count++;

        switch (this.count) {
            case 1:
                this.user["age"] = text;
                await this.sendText("Кем вы работаете?");
                break;
            case 2:
                this.user["occupation"] = text;
                await this.sendText("У Вас есть хобби?");
                break;
            case 3:
                this.user["hobby"] = text;
                await this.sendText("Что Вам не нравится в людях?");
                break;
            case 4:
                this.user["annoys"] = text;
                await this.sendText("Цели знакомства?");
                break;
            case 5:
                this.user["goals"] = text;
                const prompt = this.loadPrompt("profile");
                const info = userInfoToString(this.user);
                const myMessage = await this.sendText("ChatGPT занимается генерацией вашего профиля...")
                const answer = await chatGPT.sendQuestion(prompt, info);
                await this.editText(myMessage, answer);
                break;
            default:
                break;
        }


    }


    async gptDialogue(msg) {
        const text = msg.text;
        const myMessage = await this.sendText("Ваше сообщения передано ChatGPT...");
        const answer = await chatGPT.sendQuestion("Ответь на вопрос пожалуйста - ", `${text}`);
        await this.editText(myMessage,answer);
    }

    async opener(msg){
        this.mode = "opener";

        const text = this.loadMessage("opener");
        await this.sendImage("opener");
        await this.sendText(text);

        this.user = {};
        this.count = 0;

        await this.sendText("Имя девушки");
    }

    async openerDialogue(msg){
        const text = msg.text;
        this.count++;

        switch (this.count) {
            case 1:
                this.user["name"] = text;
                await this.sendText("Сколько ей лет?");
                break;
            case 2:
                this.user["age"] = text;
                await this.sendText("Оцените её внешность: 1-10 баллов.");
                break;
            case 3:
                this.user["handsome"] = text;
                await this.sendText("Кем она работает ?");
                break;
            case 4:
                this.user["occupation"] = text;
                await this.sendText("Цель знакомства");
                break;
            case 5:
                this.user["goals"] = text;
                const prompt = this.loadPrompt("opener");
                const info = userInfoToString(this.user);

                const myMessage = await this.sendText("ChatGPT думает над вариантом...")
                const answer = await chatGPT.sendQuestion(prompt, info);

                await this.editText(myMessage, answer);
                break;
            default:
                break;
        }
    }

    async hello(msg) {

        if (this.mode === "gpt") {
            await this.gptDialogue(msg);
        }
        else if(this.mode === "date"){
            await this.dateDialogue(msg);
        }
        else if(this.mode === "message"){
            await this.messageDialogue(msg);
        }
        else if(this.mode === "profile"){
            await this.profileDialogue(msg);
        }
        else if(this.mode === "opener"){
            await this.openerDialogue(msg);
        }
        else {
            const text = msg.text;
            await this.sendText("<b>Привет!</b>");
            await this.sendText("<i>Как дела?</i>");
            await this.sendText(`Вы писали: ${text}`);

            await this.sendImage("avatar_main");

            await this.sendTextButtons("Какая у Вас тема в Телеграм?", {
                "theme_light": "Светлая",
                "theme_dark": "Тёмная",
            });
        }
    }

    async helloButton(callbackQuery) {
        const query = callbackQuery.data;
        if (query === "theme_light") {
            await this.sendText("У Вас светлая тема.");
        } else if (query === "theme_dark") {
            await this.sendText("У Вас тёмная тема.");
        }
    }
}


const bot = new MyTelegramBot("7466348561:AAGRHKQx8dvNRA6wwJF6AyJ_dOtAsxnnYy8");
const chatGPT = new ChatGptService("gpt:pPdqYamDV0iFkELNg02NJFkblB3Tx2WqHlm0PwDlB9pl0he8");


bot.onCommand(/\/start/, bot.start);
bot.onCommand(/\/html/, bot.html);
bot.onCommand(/\/gpt/, bot.gpt);
bot.onCommand(/\/date/, bot.date);
bot.onCommand(/\/message/, bot.message);
bot.onCommand(/\/profile/, bot.profile);
bot.onCommand(/\/opener/, bot.opener);

bot.onTextMessage(bot.hello);

bot.onButtonCallback(/^date_.*/, bot.dateButton);
bot.onButtonCallback(/^message_.*/, bot.messageButton);
bot.onButtonCallback(/^.*/, bot.helloButton);