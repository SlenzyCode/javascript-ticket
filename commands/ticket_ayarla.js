const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");
module.exports = {
    name: "ticket_ayarla",
    description: "Ticket sistemini kurarasınız!",
    type: 1,
    options: [
        {
            name: "kanal",
            description: "Kanal seçiniz!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "log",
            description: "Log kanalı seçiniz!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "yetkili",
            description: "Yetkili seçiniz!",
            type: 8,
            required: true
        }
    ],
    run:async(client,interaction) => {
        const yetki1 = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({ name: "Başarısız" })
        .setDescription("Bu komutu kullanabilmek için `Yönetici` iznine sahip olmalısın!")
        if(!PermissionsBitField.Flags.Administrator) return interaction.reply({
            embeds: [yetki1],
            ephemeral: true
        });
        const kanal = interaction.options.getChannel("kanal");
        const log = interaction.options.getChannel("log");
        const yetkili = interaction.options.getRole("yetkili");
        if(db.get(`ticketSistemi_${interaction.guild.id}`)) {
            const embed = new EmbedBuilder()
            .setColor("Red")
            .setAuthor({ name: "Zaten Ayarlı 🎫" })
            .setDescription(`Ticket sistemi zaten ayarlı!`)
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: "Sıfırlamak için: /ticket_sıfırla" })
            interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
        } else {
            const embed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: "Başarılı 🎫" })
            .setDescription(`Ticket sistemi başarıyla ayarlandı!\n\nKanal: ${kanal}\nLog: ${log}\nYetkili: ${yetkili}`)
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: "Sıfırlamak için: /ticket_sıfırla" })
            interaction.reply({
                embeds: [embed]
            })
            const embed2 = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: "Ticket" })
            .setDescription(`Aşağıdaki butona basarak __destek__ talebi oluşturabilirsiniz!`)   
            const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel("Destek Oluştur")
                .setEmoji("🎟️")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("ticket_olustur")
            )
            kanal.send({
                embeds: [embed2],
                components: [button]
            })
            db.set(`ticketSistemi_${interaction.guild.id}`, { log: log.id, yetkili: yetkili.id })
        }
    }
}