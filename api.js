(function() {
    "use strict";
    const origResponseDesc = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "response");
    Object.defineProperty(XMLHttpRequest.prototype, "response", {
        get() {
            try {
                if (this.url && this.url.endsWith("/session/")) {
                    const r = origResponseDesc.get.call(this);
                    try {
                        if (r.permissions != null) {
                            r.permissions.new_scratcher = false;
                            r.permissions.scratcher = true;
                            r.user.banned = false;
                            return r;
                        }
                    } catch {}
                }
            } catch {}
            return origResponseDesc.get.call(this);
        }
    });
    const reflect = Reflect;
    const origGetPrototypeOf = Object.getPrototypeOf;
    Object.defineProperty(Object, "getPrototypeOf", {
        configurable: true,
        writable: true,
        value: function(target) {
            try {
                if (target.prototype && typeof target.prototype.connectToCloud === "function") {
                    const proto = target.prototype;
                    if (!proto.__cloudPatched) {
                        const origComponentDidMount = proto.componentDidMount;
                        proto.componentDidMount = function(...args) {
                            const ret = origComponentDidMount.apply(this, args);
                            this.shouldConnect = () => true;
                            this.shouldDisconnect = () => false;
                            this.canUseCloud = () => true;
                            if (!this.isConnected()) {
                                this.connectToCloud();
                            }
                            return ret;
                        };
                        proto.__cloudPatched = true;
                    }
                }
            } catch {}
            return reflect.getPrototypeOf(target);
        }
    });
})();
