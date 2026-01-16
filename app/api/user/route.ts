import { id } from 'zod/v4/locales';
import prisma from '../../../prisma/db';
import z from 'zod';

const User = z.object({
    name: z.string().min(2).max(100),
    password: z.string().min(8),
    email: z.string().email(),
})


export async function POST(request: Request) {

 const body = await request.json();
    
    const user = User.parse(body)
    await prisma.user.create({
        data: {
            email: user.email,
            name: user.name,
            password: user.password,
            role: 'BUSINESS',
        }
    })

}