using Microsoft.EntityFrameworkCore;
using OpenWright.Api.Runs.ValueObjects;
using OpenWright.BackendService.Projects.Domain;
using OpenWright.BackendService.Runs.Domain;
using OpenWright.BackendService.Runs.Reads.Model;
using Revo.EFCore.DataAccess.Model;

namespace OpenWright.BackendService.Core;

public class ModelDefinition : IEFCoreModelDefinition
{
    public void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<Suite>(entity =>
            {
                entity
                    .Navigation(x => x.Cases)
                    .AutoInclude();
            });
        
        modelBuilder
            .Entity<Case>(entity =>
            {
                entity
                    .Property(x => x.Tags)
                    .HasColumnType("text[]");
                
                entity
                    .OwnsMany(x => x.Annotations, a =>
                    {
                        a.ToJson("ow_cas_annotations");
                    })
                    .Navigation(x => x.Annotations)
                    .AutoInclude();

                entity
                    .OwnsOne(x => x.FileLocation, fL =>
                    {
                        fL.ToJson("ow_cas_file_location");
                    })
                    .Navigation(x => x.FileLocation)
                    .AutoInclude();
            });

        modelBuilder
            .Entity<Run>(entity =>
            {
                entity.OwnsOne(x => x.CommitInfo, cI =>
                {
                    cI.ToJson("ow_run_commit_info");
                })
                .Navigation(x => x.CommitInfo)
                .AutoInclude();

                entity.OwnsOne(x => x.Actor, a =>
                {
                    a.ToJson("ow_run_actor");
                })
                .Navigation(x => x.Actor)
                .AutoInclude();

                entity.Navigation(x => x.Cases)
                    .AutoInclude();
            });
        
        modelBuilder
            .Entity<RunView>(entity =>
            {
                entity.OwnsOne(x => x.CommitInfo, cI =>
                {
                    cI.ToJson("ow_run_commit_info");
                })
                .Navigation(x => x.CommitInfo)
                .AutoInclude();

                entity.OwnsOne(x => x.Actor, a =>
                {
                    a.ToJson("ow_run_actor");
                })
                .Navigation(x => x.Actor)
                .AutoInclude();
            });
        
        modelBuilder
            .Entity<RunCase>(entity =>
            {
                entity.OwnsMany(x => x.Annotations, a =>
                {
                    a.ToJson("ow_rca_annotations");
                })
                .Navigation(x => x.Annotations)
                .AutoInclude();

                entity.OwnsOne(x => x.FileLocation, fL =>
                {
                    fL.ToJson("ow_rca_file_location");
                })
                .Navigation(x => x.FileLocation)
                .AutoInclude();
                
                entity.Navigation(x => x.Executions)
                    .AutoInclude();
            });
        
        modelBuilder
            .Entity<CaseExecution>(entity =>
            {
                entity.OwnsMany(x => x.Errors, e =>
                {
                    e.ToJson("ow_cex_errors");
                })
                .Navigation(x => x.Errors)
                .AutoInclude();

                entity.Property(x => x.Stdout)
                    .HasColumnType("text[]");
                
                entity.Property(x => x.Stderr)
                    .HasColumnType("text[]");
            });
    }
}