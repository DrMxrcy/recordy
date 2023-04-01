import { Client, Events, GatewayIntentBits } from 'discord.js';
import { envs } from './utils/environment';
import { setupApplicationCommands } from './utils/appCommands';
import { setupFallbackRegister } from './utils/onMessages';
import { onVoiceStateChange } from './utils/onVoiceStateChange';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const onReadyPromise = new Promise((resolve, reject) => {
    client.on(Events.ClientReady, resolve);
    client.on(Events.Error, reject);
});

void (async ()=> {

    try {
        await client.login(envs.clientToken);
        await onReadyPromise;

        await setupApplicationCommands(client);
        await setupFallbackRegister(client);
        await onVoiceStateChange(client);

        console.log('Client is ready!')
    } catch (e) {
        console.error(e);
    }
})();