import Common from './common';
import { render } from '@testing-library/react';

describe('Common', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Common />);
    expect(baseElement).toBeTruthy();
  });
});
