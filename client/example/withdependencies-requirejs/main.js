define(['superagent-1.2.0'], function (request) {
  request.get('data.json').end(function (err, res) {
	  console.log(res.body);
	});
});