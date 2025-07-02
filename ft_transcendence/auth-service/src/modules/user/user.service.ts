import db from '../../db/init';
import { hashPassword } from '../../utils/hash';
import { RegisterUserInput } from './user.schema';

export async function registerUser(input: RegisterUserInput) {
    const { username, email, password } = input;
    const hashedPassword = hashPassword(password);

    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
        stmt.run(username, email, hashedPassword, function (this: any, err: any) {
            if (err) return reject(err);
            db.get('SELECT id, username, email FROM users WHERE id = ?', this.lastID, (err: any, row: any) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
        stmt.finalize();
    });
}

export async function findUserByEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err: any, row: any) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}
