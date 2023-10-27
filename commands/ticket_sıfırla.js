const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "ticket_sıfırla",
    description: "Ticket sistemini sıfırlarsınız!",
    type: 1,
    options: [],
    run:async(client,interaction) => {
        if(db.get(`ticketSistemi_${interaction.guild.id}`)) {
            db.delete(`ticketSistemi_${interaction.guild.id}`)
            db.delete(`ticketSıra_${interaction.guild.id}`)
            const embed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: "Başarılı" })
            .setDescription(`Başarıyla ticket sistemini sıfırladım!`)
            interaction.reply({
                embeds: [embed]
            })
        } else {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: "Hata" })
                    .setDescription(`Ticket sistemi zaten kurulu değil!`)
                    .setFooter({ text: "Kurmak için: /ticket_ayarla" })
                ]
            })
        }
    }
}