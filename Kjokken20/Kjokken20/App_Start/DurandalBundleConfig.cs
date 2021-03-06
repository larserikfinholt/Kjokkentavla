using System;
using System.Web.Optimization;

namespace Kjokken20 {
  public class DurandalBundleConfig {
    public static void RegisterBundles(BundleCollection bundles) {
      bundles.IgnoreList.Clear();
      AddDefaultIgnorePatterns(bundles.IgnoreList);

	  bundles.Add(
		new ScriptBundle("~/Scripts/vendor")
			.Include("~/Scripts/jquery-{version}.js")
            .Include("~/Scripts/underscore.js")
            .Include("~/Scripts/bootstrap.js")
			.Include("~/Scripts/knockout-{version}.js")
            .Include("~/Scripts/moment.js")
		);

      bundles.Add(
        new StyleBundle("~/Content/css")
          .Include("~/Content/ie10mobile.css")
          .Include("~/Content/bootstrap/bootstrap.min.css")
          .Include("~/Content/bootstrap/bootstrap-glyphicons.min.css")
          //.Include("~/Content/font-awesome.min.css")
		  .Include("~/Content/durandal.css")
          .Include("~/Content/starterkit.css")
        );

      //throw new ApplicationException("jj");
    }

    public static void AddDefaultIgnorePatterns(IgnoreList ignoreList) {
      if(ignoreList == null) {
        throw new ArgumentNullException("ignoreList"); 
      }

      ignoreList.Ignore("*.intellisense.js");
      ignoreList.Ignore("*-vsdoc.js");
      ignoreList.Ignore("*.debug.js", OptimizationMode.WhenEnabled);
      //ignoreList.Ignore("*.min.js", OptimizationMode.WhenDisabled);
      //ignoreList.Ignore("*.min.css", OptimizationMode.WhenDisabled);
    }
  }
}