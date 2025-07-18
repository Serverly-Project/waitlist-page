const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { to, subject, html, name } = JSON.parse(event.body);

        // Validate required fields
        if (!to || !subject || !html) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: to, subject, html' })
            };
        }

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: 'Serverly <waitlist@jekundayo.xyz>',
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('Resend error:', error);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Email sent successfully',
                id: data.id 
            })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};