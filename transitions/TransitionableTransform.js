/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: david@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    var Transitionable = require('./Transitionable');
    var Transform = require('famous/core/Transform');
    var Utility = require('famous/utilities/Utility');

    /**
     * A class for transitioning the state of a Transform by transitioning
     * its translate, scale, skew and rotate components independently.
     *
     * @class TransitionableTransform
     * @constructor
     *
     * @param [transform=Transform.identity] {Transform} The initial transform state
     */
    function TransitionableTransform(transform) {
        this._final = Transform.identity.slice();

        this._finalTranslate = [0, 0, 0];
        this._finalRotate = [0, 0, 0];
        this._finalSkew = [0, 0, 0];
        this._finalScale = [1, 1, 1];

        this.translate = new Transitionable(this._finalTranslate);
        this.rotateX = new Transitionable(this._finalRotate[0]);
        this.rotateY = new Transitionable(this._finalRotate[1]);
        this.rotateZ = new Transitionable(this._finalRotate[2]);
        this.skew = new Transitionable(this._finalSkew);
        this.scale = new Transitionable(this._finalScale);

        if (transform) this.set(transform);
    }

    function _build() {
        return Transform.build({
            translate: this.translate.get(),
            rotate: [this.rotateX.get(), this.rotateY.get(), this.rotateZ.get()],
            skew: this.skew.get(),
            scale: this.scale.get()
        });
    }

    function _buildFinal() {
        return Transform.build({
            translate: this._finalTranslate,
            rotate: this._finalRotate,
            skew: this._finalSkew,
            scale: this._finalScale
        });
    }

    /**
     * An optimized way of setting only the translation component of a Transform
     *
     * @method setTranslate
     * @chainable
     *
     * @param translate {Array}     New translation state
     * @param [transition] {Object} Transition definition
     * @param [callback] {Function} Callback
     * @return {TransitionableTransform}
     */
    TransitionableTransform.prototype.setTranslate = function setTranslate(translate, transition, callback) {
        this._finalTranslate = translate;
        this._final = _buildFinal.call(this);
        this.translate.set(translate, transition, callback);
        return this;
    };

    /**
     * An optimized way of setting only the scale component of a Transform
     *
     * @method setScale
     * @chainable
     *
     * @param scale {Array}         New scale state
     * @param [transition] {Object} Transition definition
     * @param [callback] {Function} Callback
     * @return {TransitionableTransform}
     */
    TransitionableTransform.prototype.setScale = function setScale(scale, transition, callback) {
        this._finalScale = scale;
        this._final = _buildFinal.call(this);
        this.scale.set(scale, transition, callback);
        return this;
    };

    /**
     * An optimized way of setting only the rotational component of a Transform
     *
     * @method setRotate
     * @chainable
     *
     * @param eulerAngles {Array}   Euler angles for new rotation state
     * @param [transition] {Object} Transition definition
     * @param [callback] {Function} Callback
     * @return {TransitionableTransform}
     */
    TransitionableTransform.prototype.setRotate = function setRotate(eulerAngles, transition, callback) {
        if (eulerAngles[0] !== null) {
            this.rotateX.set(eulerAngles[0], transition, callback);
            this._finalRotate[0] = eulerAngles[0];
        }
        if (eulerAngles[1] !== null) {
            this.rotateY.set(eulerAngles[1], transition, callback);
            this._finalRotate[1] = eulerAngles[1];
        }
        if (eulerAngles[2] !== null) {
            this.rotateZ.set(eulerAngles[2], transition, callback);
            this._finalRotate[2] = eulerAngles[2];
        }
        this._final = _buildFinal.call(this);
        return this;
    };

    /**
     * An optimized way of setting only the skew component of a Transform
     *
     * @method setSkew
     * @chainable
     *
     * @param skewAngles {Array}    New skew state
     * @param [transition] {Object} Transition definition
     * @param [callback] {Function} Callback
     * @return {TransitionableTransform}
     */
    TransitionableTransform.prototype.setSkew = function setSkew(skewAngles, transition, callback) {
        this._finalSkew = skewAngles;
        this._final = _buildFinal.call(this);
        this.skew.set(skewAngles, transition, callback);
        return this;
    };

    /**
     * Setter for a TransitionableTransform with optional parameters to transition
     * between Transforms
     *
     * @method set
     * @chainable
     *
     * @param transform {Array}     New transform state
     * @param [transition] {Object} Transition definition
     * @param [callback] {Function} Callback
     * @return {TransitionableTransform}
     */
    TransitionableTransform.prototype.set = function set(transform, transition, callback) {
        var components = Transform.interpret(transform);

        this._finalTranslate = components.translate;
        this._finalRotate = components.rotate;
        this._finalSkew = components.skew;
        this._finalScale = components.scale;
        this._final = transform;

        var _callback = callback ? Utility.after(4, callback) : null;
        this.translate.set(components.translate, transition, _callback);
        this.rotateX.set(components.rotate[0], transition, _callback);
        this.rotateY.set(components.rotate[1], transition, _callback);
        this.rotateZ.set(components.rotate[2], transition, _callback);
        this.skew.set(components.skew, transition, _callback);
        this.scale.set(components.scale, transition, _callback);
        return this;
    };

    /**
     * Sets the default transition to use for transitioning betwen Transform states
     *
     * @method setDefaultTransition
     *
     * @param transition {Object} Transition definition
     */
    TransitionableTransform.prototype.setDefaultTransition = function setDefaultTransition(transition) {
        this.translate.setDefault(transition);
        this.rotateX.setDefault(transition);
        this.rotateY.setDefault(transition);
        this.rotateZ.setDefault(transition);
        this.skew.setDefault(transition);
        this.scale.setDefault(transition);
    };

    /**
     * Getter. Returns the current state of the Transform
     *
     * @method get
     *
     * @return {Transform}
     */
    TransitionableTransform.prototype.get = function get() {
        if (this.isActive()) {
            return _build.call(this);
        }
        else return this._final;
    };

    /**
     * Get the destination state of the Transform
     *
     * @method getFinal
     *
     * @return Transform {Transform}
     */
    TransitionableTransform.prototype.getFinal = function getFinal() {
        return this._final;
    };

    /**
     * Determine if the TransitionalTransform is currently transitioning
     *
     * @method isActive
     *
     * @return {Boolean}
     */
    TransitionableTransform.prototype.isActive = function isActive() {
        return this.translate.isActive() || this.rotateX.isActive() || this.rotateY.isActive() || this.rotateZ.isActive() || this.scale.isActive() || this.skew.isActive();
    };

    /**
     * Halts the transition
     *
     * @method halt
     */
    TransitionableTransform.prototype.halt = function halt() {
        this._final = this.get();
        this.translate.halt();
        this.rotateX.halt();
        this.rotateY.halt();
        this.rotateZ.halt();
        this.skew.halt();
        this.scale.halt();
    };

    module.exports = TransitionableTransform;
});
