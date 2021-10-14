import React from 'react';
import Accordion from '.';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount, shallow } from 'enzyme';

configure({ adapter: new Adapter() });

describe('Accordion', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <Accordion heading="Title here">
        <div className="child">1</div>
        <div className="child">2</div>
      </Accordion>
    );

    expect(wrapper.find('.accordion').length).toBe(1);
    expect(wrapper.find('.accordion__title').length).toBe(1);
    expect(wrapper.find('.child').length).toBe(2);
  });

  it('handle collapse button click event', () => {
    const setCollapsed = jest.fn();
    const wrapper = mount(
      <Accordion>
        <div className="child">1</div>
        <div className="child">2</div>
      </Accordion>
    );
    const onClick = jest.spyOn(React, 'useState');

    onClick.mockImplementation((collapsed) => [collapsed, setCollapsed]);
    wrapper.find('.accordion__toggle').simulate('click');
    expect(setCollapsed).toBeTruthy();
    expect(wrapper.find('.accordion__content--hide').length).toBe(1);
  });
});
