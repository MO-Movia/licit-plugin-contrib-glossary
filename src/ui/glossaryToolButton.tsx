import * as React from 'react';
import cx from 'classnames';
import {
  TooltipSurface,
  PointerSurfaceProps,
  PointerSurface,
} from '@modusoperandi/licit-ui-commands';

export class GlossaryToolButton extends React.PureComponent {
  props: PointerSurfaceProps & {
    icon?: string | React.ReactNode | null;
    label?: string | React.ReactNode | null;
  };

  render() {
    const {icon, label, className, title, ...pointerProps} = this.props;
    const klass = cx(className, 'czi-custom-button', {
      'use-icon': !!icon,
    });
    return (
      <TooltipSurface tooltip={title}>
        <PointerSurface {...pointerProps} className={klass}>
          {icon}
          {label}
        </PointerSurface>
      </TooltipSurface>
    );
  }
}

export default GlossaryToolButton;
