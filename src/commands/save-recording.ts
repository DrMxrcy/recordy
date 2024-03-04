import { Command } from '../utils/appCommands';
import { APIApplicationCommandOptionChoice, SlashCommandBuilder } from 'discord.js';
import { voiceRecorder } from '../utils/voice';
import { AudioExportType } from '@kirdock/discordjs-voice-recorder/lib/models/types';

type Choices = APIApplicationCommandOptionChoice & {value: AudioExportType};
const choices: Choices[] = [
    {name: 'single', value: 'single'},
    {name: 'separate', value: 'separate'}
];

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('save')
        .setDescription(`Save the last x minutes (Max 60 minutes)`)
        .addIntegerOption(option =>
            option
                .setName('minutes')
                .setDescription('How many minutes should be saved (Max 60 minutes)')
                .setMinValue(1)
                .setMaxValue(60)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Save as single file or as zip file with a file per user')
                .setChoices(...choices)
        )
        .addStringOption(option =>
            option
                .setName('customname')
                .setDescription('Custom name for the saved file (special characters will be removed)')
        )
        .toJSON(),
    async execute(interaction) {
        if (!interaction.guildId) {
            return 'No guild provided';
        }

        const guild = interaction.inCachedGuild() ? await interaction.guild.fetch() : interaction.guild;
        if (!guild) {
            return 'Guild cannot be fetched';
        }

        await interaction.deferReply();
        const minutes = interaction.options.getInteger('minutes') ?? 1;
        const exportType = interaction.options.getString('type') as AudioExportType | null ?? 'single';
        let customNameInput = interaction.options.getString('customname');
        customNameInput = customNameInput ? customNameInput.replace(/[^a-zA-Z0-9-_]/g, '_') : '';

        const date = new Date().toISOString().replace(/[:.-]/g, '_'); //

        const baseFileName = `${customNameInput}${customNameInput ? '-' : ''}Recording_${date}`;

        let fileType: string, fileName: string;
        if (exportType === 'single') {
            fileType = 'audio/mp3';
            fileName = `${baseFileName}.mp3`;
        } else {
            fileType = 'application/zip';
            fileName = `${baseFileName}-all-streams.zip`;
        }

        const buffer = await voiceRecorder.getRecordedVoiceAsBuffer(interaction.guildId, exportType, minutes);

        await interaction.editReply({
            files: [{
                attachment: buffer,
                contentType: fileType,
                name: fileName,
            }],
        });
    },
};

export default command;
