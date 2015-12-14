import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/lib/text-field';

const Home = () => (
  <div className='screen'>
    <form>
      <TextField
        hintText='Hint Text'
        floatingLabelText='Floating Label Text' />
    </form>
  </div>
);

export default Home;
