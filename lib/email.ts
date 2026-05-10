import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOrderNotification(order: {
  id: string
  clientName: string
  clientEmail: string
  items: { productName: string; productCode: string; quantity: number; notes?: string | null }[]
  notes?: string | null
}) {
  const itemsList = order.items
    .map(
      (item) =>
        `• [${item.productCode}] ${item.productName} × ${item.quantity}${item.notes ? ` (Nota: ${item.notes})` : ''}`
    )
    .join('\n')

  const whatsappMsg = encodeURIComponent(
    `🌊 *MAPALI BEACH* - Nuevo pedido #${order.id.slice(-6).toUpperCase()}\n\n👤 Cliente: ${order.clientName}\n📧 Email: ${order.clientEmail}\n\n📦 Artículos:\n${order.items.map(i => `• [${i.productCode}] ${i.productName} ×${i.quantity}`).join('\n')}\n\n⏳ Estado: Pendiente de revisión`
  )
  const whatsappUrl = `https://wa.me/${process.env.ADMIN_PHONE}?text=${whatsappMsg}`

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `🌊 Nuevo Pre-orden Mapali Beach #${order.id.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF8F0;">
          <div style="background: linear-gradient(135deg, #5DBFAD, #E07B54); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌴 MAPALI BEACH</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Nuevo Pre-orden Recibido</p>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #5C3D1E;">Pre-orden #${order.id.slice(-6).toUpperCase()}</h2>
            <p><strong>Cliente:</strong> ${order.clientName}</p>
            <p><strong>Email:</strong> ${order.clientEmail}</p>
            ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
            <h3 style="color: #5C3D1E; border-bottom: 2px solid #5DBFAD; padding-bottom: 10px;">Artículos Solicitados</h3>
            <pre style="background: #F5F0E8; padding: 15px; border-radius: 8px; font-size: 14px;">${itemsList}</pre>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${whatsappUrl}" style="background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">📲 Ver en WhatsApp</a>
            </div>
          </div>
          <div style="background: #5C3D1E; color: #D4A456; text-align: center; padding: 15px;">
            <p style="margin: 0; font-size: 12px;">Mapali Beach · Our nature made jewelry</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Error sending email:', err)
  }
}
