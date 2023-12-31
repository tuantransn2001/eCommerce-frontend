/* eslint-disable import/extensions */
import Content from './content';
import Subscribe from './subscribe';
import Payment from './payment';
import Copyright from './copyright';
import FooterLogo from './logo';
import classNames from 'classnames/bind';
const cx = classNames.bind(require('./style/Footer.module.scss'));
export default function Footer({}) {
  return (
    <footer className={cx('container')}>
      <FooterLogo />
      <Content />
      <Subscribe />
      <Payment />
      <Copyright />
    </footer>
  );
}
