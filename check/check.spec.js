const validator = require('validator');
const expect = require('chai').expect;
const check = require('./check');

describe('check: low-level middleware', () => {
  it('returns chain with all validator\'s validation methods', () => {
    const chain = check('foo', []);
    Object.keys(validator)
      .filter(methodName => methodName.startsWith('is'))
      .forEach(methodName => {
        expect(chain).to.have.property(methodName);
      });

    expect(chain).to.have.property('contains');
    expect(chain).to.have.property('equals');
    expect(chain).to.have.property('matches');
  });

  describe('validation errors', () => {
    it('are pushed to req._validationErrors', () => {
      const req = {
        body: { foo: 'foo@example.com', bar: 'not_email' }
      };

      return check(['foo', 'bar'], ['body']).isEmail()(req, {}, () => {}).then(() => {
        expect(req)
          .to.have.property('_validationErrors')
          .that.is.an('array')
          .that.has.lengthOf(1);
      });
    });

    it('are kept from other middleware calls', () => {
      const req = {
        query: { foo: '123', bar: 'BAR' }
      };

      return Promise.all([
        check('foo', ['query']).isAlpha()(req, {}, () => {}),
        check('bar', ['query']).isInt()(req, {}, () => {})
      ]).then(() => {
        expect(req._validationErrors).to.have.length(2);
      });
    });
  });
});