class RequestBuilder {

    constructor(engine) {
		this.engine = engine;
    }

	createOperator(data) {
		var $node = $(`
			<div class="request-element request-operator input-group input-group-sm mb-3">
				<div class="input-group-prepend">
					<select class="operator-value custom-select" id="inputGroupSelect01">
						<option value="and" selected>AND</option>
						<option value="or">OR</option>
					</select>
				</div>
				<div class="operator-body form-control" style="height: auto;">
					<div class="request-elements">
					</div>
				</div>
			</div>`);
		return new RequestOperator($node, this.engine, data);
	}
	createPredicateRequest(data) {
		var $node = $(`
			<div class="request-element input-group mb-3">
				<div class="input-group-prepend">
					<select class="custom-select rt-select">
					</select>
					<select class="custom-select rt-field-select">
					</select>
					<select class="custom-select value-search-operator">
						<option value="contains" selected>cont.</option>
						<option value="equals">equ.</option>
						<option value="starts">starts</option>
						<option value="ends">ends</option>
					</select>
				</div>
				<input type="text" class="form-control value-input" placeholder="" aria-label="" aria-describedby="basic-addon1">
			</div>
		`);
		return new PredicateRequest($node, this.engine, data);
	}
	createRequestAdderButton() {
		var $node = $(`
			<div class="request-element-adder dropdown">
				<div class="dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				    <div class="icon icon-plus-squared"></div>
				</div>
				<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
					<a class="dropdown-item" value="createOperator" href="#">Operator</a>
					<a class="dropdown-item" value="createPredicateRequest" href="#">Predicate</a>
				</div>

			</div>`);
		return new BDropdownMenu($node);
	}
	createRequestRemoverButton() {
		var $node = $(`<div class="request-element-remover"><div class="icon icon-cancel"></div></div>`);
		return new BButton($node);
	}

}