const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder, AuditLogEvent } = require("discord.js");
const Discord = require("discord.js");
const fs = require("fs");

const client = new Client({
    intents: Object.values(Discord.IntentsBitField.Flags),
    partials: Object.values(Partials)
});

const PARTIALS = Object.values(Partials);
const db = require("croxydb");
const config = require("./config.json");
const chalk = require("chalk");

global.client = client;
client.commands = (global.commands = []);
const { readdirSync } = require("fs");
const interactionCreate = require("./events/interactionCreate");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: false,
        type: 1
    });
    console.log(chalk.red`[COMMAND]` + ` ${props.name} komutu yüklendi.`)
});

readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(chalk.blue`[EVENT]` + ` ${name} eventi yüklendi.`)
});

client.login(config.TOKEN)

process.on("unhandledRejection", async (e) => {
    return console.log(chalk.red(`Bir hata oluştu\n${e}`))
})

// Komutlar

// Ticket Sistemi
client.on("interactionCreate", async (interaction) => {
    if(interaction.customId === "ticket_olustur") {
        const datas = db.get(`ticketSistemi_${interaction.guild.id}`)
        if(datas) {
            db.add(`ticketSıra_${interaction.guild.id}`,1)
            const sıra = db.get(`ticketSıra_${interaction.guild.id}`)
            interaction.guild.channels.create({
                name: `ticket-${sıra}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: datas.yetkili,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    },
                ]
            }).then(cha => {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor("Green")
                        .setAuthor({ name: "Başarılı" })
                        .setDescription(`Başarıyla __destek__ talebin oluşturuldu ${cha}`)
                    ],
                    ephemeral: true
                })
                const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: "Ticket" })
                .setDescription(`Başarıyla __destek__ talebin açıldı yetkilileri bekle!`)
                .setThumbnail(interaction.guild.iconURL())
                const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel("Desteği Sonlandır")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("ticket_sonlandir")
                )
                cha.send({
                    embeds: [embed],
                    components: [button]
                })
            })
        } else {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: "Başarısız" })
                    .setDescription(`Ticket sistemi devre dışı!`)
                ],
                ephemeral: true
            })
        }
    }
})

client.on("interactionCreate", async (interaction) => {
    if(interaction.customId === "ticket_sonlandir") {
        const datas = db.get(`ticketSistemi_${interaction.guild.id}`)
        const data = client.channels.cache.get(datas.log)
        data.send({
            embeds: [
                new EmbedBuilder()
                .setColor("Yellow")
                .setAuthor({ name: "Ticket Log" })
                .setDescription(`Destek talebi kapatıldı kapatan kullanıcı <@${interaction.user.id}> (${interaction.user.username})`)
            ]
        })
        interaction.channel.delete()
    }
})