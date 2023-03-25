import { expect } from 'chai';
import PasswordHasher from '../../src/domain/PasswordHasher';

describe('Password Hasher', () => {
  const password = 'TestPass';
  it('can hash passords', async () => {
    const hashedPassword = await PasswordHasher.toHash(password);

    expect(hashedPassword.length > password.length).to.eq(true);
    expect(password).not.to.eq(hashedPassword);
  });

  it('can verify provided password, same as stored password', async () => {
    const storedPassord = await PasswordHasher.toHash(password);

    expect(await PasswordHasher.exactMatch(storedPassord, password)).to.eq(
      true
    );
  });
});
