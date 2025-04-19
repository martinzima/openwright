using Microsoft.EntityFrameworkCore;
using OpenWright.BackendService.Projects.Domain;
using OpenWright.BackendService.Runs.Domain;
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
                    .HasMany(x => x.Suites)
                    .WithOne(x => x.ParentSuite);
            });
        
        modelBuilder
            .Entity<Case>(entity =>
            {
                entity
                    .OwnsMany(x => x.Annotations, a =>
                    {
                        a.ToJson();
                    });

                entity
                    .OwnsOne(x => x.FileLocation, fL =>
                    {
                        fL.ToJson();
                    });
            });

        modelBuilder
            .Entity<Run>(entity =>
            {
                entity.OwnsOne(x => x.CommitInfo, cI =>
                {
                    cI.ToJson();
                });

                entity.OwnsOne(x => x.Actor, a =>
                {
                    a.ToJson();
                });
            });
        
        modelBuilder
            .Entity<RunCase>(entity =>
            {
                entity.OwnsMany(x => x.Annotations, a =>
                {
                    a.ToJson();
                });

                entity.OwnsOne(x => x.FileLocation, fL =>
                {
                    fL.ToJson();
                });
            });
        
        modelBuilder
            .Entity<CaseExecution>(entity =>
            {
                entity.OwnsMany(x => x.Errors, e =>
                {
                    e.ToJson();
                });
            });
    }
}