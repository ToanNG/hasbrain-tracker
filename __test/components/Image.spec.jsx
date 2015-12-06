import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import {expect} from 'chai';
import {spy} from 'sinon';
import rewire from 'rewire';

const {renderIntoDocument} = ReactTestUtils;
const ImageComponent = rewire('../../app/scripts/components/Image');

describe('Image', () => {

  it('invokes callback when the image is loaded', (done) => {
    const handleLoad = spy();
    const ImageMock = function() {
      setTimeout(() => {
        this.onload();
        expect(handleLoad).to.have.been.called;
        done();
      }, 0);
    };

    ImageComponent.__set__('Image', ImageMock);
    renderIntoDocument(
      <ImageComponent
        src='image.png'
        onLoad={handleLoad}
      />
    );
  });

});
