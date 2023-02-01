import cx from 'classnames';
import * as React from 'react';
const VALID_CHARS = /[a-z_]+/;
const cached = {};

class GlossarySubMenuIcon extends React.PureComponent {
  // Get the static Icon.
  static get(type: string, title?: string): React.ReactNode {
    const key = `${type || ''}-${title || ''}`;
    const icon = cached[key] || <GlossarySubMenuIcon title={title} type={type} />;
    cached[key] = icon;
    return icon;
  }

  props: {
    type: string;
    title?: string;
  };

  render() {
    const {type, title} = this.props;
    let className = '';
    let children = '';
    if (!type || !VALID_CHARS.test(type)) {
      className = cx('czi-icon-unknown');
      children = title || type;
    } else {
      className = cx('czi-icon', {[type]: true});
      children = type;
    }
    return <span className={className}>{children}</span>;
  }
}

export default GlossarySubMenuIcon;
