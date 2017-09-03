using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace TeamWorkSolutions.Plugins
{
    public class DeleteRecordPlugin : IPlugin
    {

        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)
               serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

            if (context.InputParameters.Contains("Target"))
            {
                Entity entity = (Entity)context.InputParameters["Target"];
                if (entity.Contains("team_delete")
                   && entity["team_delete"] != null
                   && (bool)entity["team_delete"])
                {
                    service.Delete(entity.LogicalName, entity.Id);
                }
            }
        }
    }
}
